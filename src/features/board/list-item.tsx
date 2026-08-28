import { ElementRef, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";

import { cn } from "@/lib/utils";
import { ListWithCards } from "@/types";

import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";

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
                  {data.cards.map((card, index) => (
                    <CardItem index={index} key={card.id} data={card} />
                  ))}
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
