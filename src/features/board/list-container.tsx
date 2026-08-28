import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useBoardAutoScroll } from "@/hooks/use-board-auto-scroll";

import { ListWithCards } from "@/types";
import { tauriApi } from "@/lib/tauri";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export const ListContainer = ({ data, boardId, scrollContainerRef }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);
  const [isDragging, setIsDragging] = useState(false);

  useBoardAutoScroll({
    containerRef: scrollContainerRef || { current: null },
    isDragging,
  });
  const skipNextSync = useRef(false);

  useEffect(() => {
    // Check if card or list counts changed (e.g. newly created or deleted card/list)
    const prevCardCount = orderedData.reduce((acc, l) => acc + (l.cards?.length || 0), 0);
    const newCardCount = data.reduce((acc, l) => acc + (l.cards?.length || 0), 0);
    const listCountChanged = data.length !== orderedData.length;

    // ALWAYS sync immediately whenever cards or lists are added or removed
    if (listCountChanged || prevCardCount !== newCardCount) {
      skipNextSync.current = false;
      setOrderedData(data);
      return;
    }

    // Only skip once if this was an in-place drag reorder
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    setOrderedData(data);
  }, [data, orderedData]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // User moves a list
    if (type === "list") {
      const items = reorder(
        orderedData,
        source.index,
        destination.index
      ).map((item, index) => ({ ...item, order_idx: index + 1 }));

      // Guard: skip the next useEffect sync from React Query refetch
      skipNextSync.current = true;
      setOrderedData(items);

      try {
        await tauriApi.updateListOrder(
          items.map((item) => ({ id: item.id, order_idx: item.order_idx }))
        );
        toast.success("List reordered");
      } catch (error) {
        // On failure, allow sync to recover state
        skipNextSync.current = false;
        toast.error(String(error));
      }
    }

    // User moves a card
    if (type === "card") {
      // Deep clone to avoid mutating React state directly
      const newOrderedData = orderedData.map((list) => ({
        ...list,
        cards: [...list.cards],
      }));

      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) {
        return;
      }

      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      if (!destList.cards) {
        destList.cards = [];
      }

      // Moving card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );

        reorderedCards.forEach((card, idx) => {
          card.order_idx = idx + 1;
        });

        sourceList.cards = reorderedCards;

        skipNextSync.current = true;
        setOrderedData(newOrderedData);

        try {
          await tauriApi.updateCardOrder(
            reorderedCards.map((card) => ({
              id: card.id,
              order_idx: card.order_idx,
              list_id: card.list_id,
            }))
          );
          toast.success("Card reordered");
        } catch (error) {
          skipNextSync.current = false;
          toast.error(String(error));
        }
      } else {
        // User moves card to another list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        movedCard.list_id = destination.droppableId;

        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, idx) => {
          card.order_idx = idx + 1;
        });

        destList.cards.forEach((card, idx) => {
          card.order_idx = idx + 1;
        });

        skipNextSync.current = true;
        setOrderedData(newOrderedData);

        try {
          // Send both source and dest card orders to ensure consistency
          const allCards = [
            ...sourceList.cards.map((card) => ({
              id: card.id,
              order_idx: card.order_idx,
              list_id: card.list_id,
            })),
            ...destList.cards.map((card) => ({
              id: card.id,
              order_idx: card.order_idx,
              list_id: card.list_id,
            })),
          ];
          await tauriApi.updateCardOrder(allCards);
          toast.success("Card moved");
        } catch (error) {
          skipNextSync.current = false;
          toast.error(String(error));
        }
      }
    }
  };

  return (
    <DragDropContext
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(result) => {
        setIsDragging(false);
        onDragEnd(result);
      }}
    >
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => {
              return (
                <ListItem
                  key={list.id}
                  index={index}
                  data={list}
                  boardId={boardId}
                />
              );
            })}
            {provided.placeholder}
            <ListForm boardId={boardId} />
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
