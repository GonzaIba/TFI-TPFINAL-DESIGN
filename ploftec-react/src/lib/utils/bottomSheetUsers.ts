type DragEvent = MouseEvent | TouchEvent;

const getPointerY = (event: DragEvent): number => {
  if ("touches" in event && event.touches.length > 0) {
    return event.touches[0].pageY;
  }
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return event.changedTouches[0].pageY;
  }
  return (event as MouseEvent).pageY;
};

export function initBottomSheetUsers() {
  if (typeof document === "undefined") return;

  const openSheetButtons =
    document.querySelectorAll<HTMLButtonElement>(".btn-table-user");
  const sheet = document.querySelector<HTMLElement>("#sheet");
  if (!sheet) return;

  const sheetContents = sheet.querySelector<HTMLElement>(".contents");
  const draggableArea = sheet.querySelector<HTMLElement>(".draggable-area");
  const closeButton = sheet.querySelector<HTMLButtonElement>(".close-sheet");
  const overlay = sheet.querySelector<HTMLDivElement>(".overlay");

  if (!sheetContents || !draggableArea || !closeButton || !overlay) return;

  let sheetHeight = 0; // in vh

  const setSheetHeight = (value: number) => {
    sheetHeight = Math.max(0, Math.min(100, value));
    sheetContents.style.height = `calc(${sheetHeight}vh - 80px)`;

    if (sheetHeight === 100) {
      sheetContents.classList.add("fullscreen");
    } else {
      sheetContents.classList.remove("fullscreen");
    }
  };

  const setIsSheetShown = (value: boolean) => {
    sheet.setAttribute("aria-hidden", String(!value));
  };

  openSheetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSheetHeight(Math.min(720, (720 / window.innerHeight) * 100));
      setIsSheetShown(true);
    });
  });

  closeButton.addEventListener("click", () => {
    setIsSheetShown(false);
  });

  overlay.addEventListener("click", () => {
    setIsSheetShown(false);
  });

  let dragPosition: number | undefined;

  const onDragStart = (event: DragEvent) => {
    dragPosition = getPointerY(event);
    sheetContents.classList.add("not-selectable");
    draggableArea.style.cursor = document.body.style.cursor = "grabbing";
  };

  const onDragMove = (event: DragEvent) => {
    if (dragPosition === undefined) return;

    const y = getPointerY(event);
    const deltaY = dragPosition - y;
    const deltaHeight = (deltaY / window.innerHeight) * 100;

    setSheetHeight(sheetHeight + deltaHeight);
    dragPosition = y;
  };

  const onDragEnd = () => {
    dragPosition = undefined;
    sheetContents.classList.remove("not-selectable");
    draggableArea.style.cursor = document.body.style.cursor = "";

    if (sheetHeight < 25) {
      setIsSheetShown(false);
    } else if (sheetHeight > 75) {
      setSheetHeight(100);
    } else {
      setSheetHeight(Math.min(720, (720 / window.innerHeight) * 100));
    }
  };

  draggableArea.addEventListener("mousedown", onDragStart);
  draggableArea.addEventListener("touchstart", onDragStart);

  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("touchmove", onDragMove);

  window.addEventListener("mouseup", onDragEnd);
  window.addEventListener("touchend", onDragEnd);
}
