import { ReactElement, useEffect, useRef } from "react";
import { PageNavigationListenerContainerProps } from "../typings/PageNavigationListenerProps";

export function PageNavigationListener({ onNavigate }: PageNavigationListenerContainerProps): ReactElement | null {
    const observerRef = useRef<MutationObserver | null>(null);
    const isExecutingRef = useRef<boolean>(false);

    useEffect(() => {
        // Execute action immediately when page changes
        const executeAction = (): void => {
            // Prevent execution if already executing to avoid infinite loops
            if (isExecutingRef.current) {
                return;
            }

            if (onNavigate && onNavigate.canExecute) {
                isExecutingRef.current = true;

                try {
                    onNavigate.execute();
                } finally {
                    // Reset execution flag after a short delay to allow DOM to settle
                    setTimeout(() => {
                        isExecutingRef.current = false;
                    }, 100);
                }
            }
        };

        // Execute action on initial mount (page load)
        executeAction();

        // Set up MutationObserver to detect content changes in .mx-placeholder
        observerRef.current = new MutationObserver(() => {
            executeAction();
        });

        // Find and observe the .mx-placeholder element specifically
        const placeholder = document.querySelector(".mx-placeholder");
        if (placeholder) {
            observerRef.current.observe(placeholder, {
                childList: true,
                subtree: false
            });
        }

        // Cleanup function
        return () => {
            // Disconnect MutationObserver if active
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [onNavigate]);

    // Widget has no UI - return null
    return null;
}
