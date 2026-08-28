import { ElementRef, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";

import { cn } from "@/lib/utils";
import { ListWithCards } from "@/types";

import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";
import { useBoardFilter } from "@/stores/use-board-filter";

interface ListItemProps {
  data: ListWithCards;
  index: number;
  boardId: string;
}

export const ListItem = ({ data, index, boardId }: ListItemProps) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { keyword, selectedStatuses, selectedLabels, getActiveFilterCount } = useBoardFilter();
  const hasActiveFilters = getActiveFilterCount() > 0;

  const filteredCards = data.cards.filter((card) => {
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchDesc = card.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedStatuses.length > 0) {
      const cardStatus = card.status || "ACTIVE";
      if (!selectedStatuses.includes(cardStatus)) return false;
    }
    if (selectedLabels.length > 0) {
      let cardLabels: string[] = [];
      try {
        if (card.labels) cardLabels = JSON.parse(card.labels);
      } catch {
        if (card.labels) cardLabels = card.labels.split(",").map((s) => s.trim());
      }
      const hasMatch = cardLabels.some((l) => selectedLabels.includes(l));
      if (!hasMatch) return false;
    }
    return true;
  });

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="shrink-0 h-full w-80 select-none"
        >
          <div
            {...provided.dragHandleProps}
            className="w-full rounded-none bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] pb-3 shadow-sm dark:shadow-none flex flex-col max-h-[calc(100vh-140px)]"
          >
            <ListHeader
              onAddCard={enableEditing}
              data={data}
              boardId={boardId}
            />
            <Droppable droppableId={data.id} type="card">
              {(provided, snapshot) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "px-3 pt-3 pb-1 flex-1 overflow-y-auto flex flex-col",
                    snapshot.isDraggingOver
                      ? "bg-zinc-100/80 dark:bg-[#18181B]/80"
                      : "bg-transparent"
                  )}
                  style={{ minHeight: 10 }}
                >
                  {filteredCards.map((card, index) => (
                    <CardItem index={index} key={card.id} data={card} />
                  ))}
                  {filteredCards.length === 0 && data.cards.length > 0 && hasActiveFilters && (
                    <div className="py-6 text-center text-[10px] font-mono text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
                      NO MATCHING CARDS
                    </div>
                  )}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
            <CardForm
              listId={data.id}
              boardId={boardId}
              ref={textareaRef}
              isEditing={isEditing}
              enableEditing={enableEditing}
              disableEditing={disableEditing}
            />
          </div>
        </li>
      )}
    </Draggable>
  );
};
