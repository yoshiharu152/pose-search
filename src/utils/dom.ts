export function isElementInViewport(el: Element) {
    const rect = el.getBoundingClientRect(),
        width = rect.right - rect.left,
        height = rect.bottom - rect.top;
    return (
        rect.top > -height &&
        rect.left > -width &&
        rect.bottom < (window.innerHeight || document.documentElement.clientHeight) + height &&
        rect.right < (window.innerWidth || document.documentElement.clientWidth) + width
    );
}

/**
 * Allow mouse dragging outside the dragged element.
 */
export function addGlobalDragListener(
    startEvent: PointerEvent,
    onDragMove: (e: PointerEvent) => void,
    onDragEnd?: (e: PointerEvent) => void
) {
    const target = startEvent.target as HTMLElement;
    const pointerId = startEvent.pointerId;

    target.setPointerCapture(pointerId);

    const onPointerMove = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        onDragMove(e);
    };

    const end = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;

        cleanup();

        try {
            target.releasePointerCapture(pointerId);
        } catch {
        }

        onDragEnd?.(e);
    };

    const cleanup = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);

    onDragMove(startEvent);
}
