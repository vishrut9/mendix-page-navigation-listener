import { ReactElement, useEffect, useRef } from "react";
import { PageNavigationListenerContainerProps } from "../typings/PageNavigationListenerProps";

export function PageNavigationListener({ onNavigate }: PageNavigationListenerContainerProps): ReactElement | null {
    const observerRef = useRef<MutationObserver | null>(null);
    const isExecutingRef = useRef<boolean>(false);
    const currentPageRef = useRef<string | null>(null);

    useEffect(() => {
        // Get a stable page identifier
        const getCurrentPageId = (): string | null => {
            const placeholder = document.querySelector(".mx-placeholder");
            if (!placeholder) {
                return null;
            }

            // Method 1: Look for element with mx-name-* class (most reliable)
            const pageElement = placeholder.querySelector('[class*="mx-name-"]');
            if (pageElement) {
                // Extract just the mx-name-pageXXX part
                const match = pageElement.className.match(/mx-name-\w+/);
                return match ? match[0] : null;
            }

            // Method 2: Look for data-mendix-page attribute (if available)
            const pageWithDataAttr = placeholder.querySelector("[data-mendix-page]");
            if (pageWithDataAttr) {
                return pageWithDataAttr.getAttribute("data-mendix-page");
            }

            // Method 3: Fallback - use page container's class pattern
            const pageContainer = placeholder.querySelector(".mx-scrollcontainer-wrapper, .page-content");
            if (pageContainer && pageContainer.firstElementChild) {
                const match = pageContainer.firstElementChild.className.match(/mx-name-\w+/);
                return match ? match[0] : null;
            }

            return null;
        };

        // Execute action immediately when page changes
        const executeAction = (): void => {
            // Prevent execution if already executing to avoid infinite loops
            if (isExecutingRef.current) {
                return;
            }

            // Get current page identifier
            const currentPage = getCurrentPageId();

            // Only execute if we have a valid page and it's different from last page
            if (!currentPage) {
                console.log("[PageNavigationListener] No page identifier found yet, skipping");
                return;
            }

            if (currentPage === currentPageRef.current) {
                console.log("[PageNavigationListener] Same page detected:", currentPage, "- skipping execution");
                return;
            }

            console.log(
                "[PageNavigationListener] New page detected:",
                currentPage,
                "(previous:",
                currentPageRef.current,
                ")"
            );
            currentPageRef.current = currentPage;

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
                subtree: true
            });
        }

        // RETRY LOGIC COMMENTED OUT - Use if widget doesn't work in cloud deployment
        /*
        const setupObserver = (retryCount = 0): void => {
            const placeholder = document.querySelector(".mx-placeholder");

            if (placeholder) {
                // Found the placeholder, set up observer
                observerRef.current = new MutationObserver(() => {
                    executeAction();
                });

                observerRef.current.observe(placeholder, {
                    childList: true,
                    subtree: false
                });

                console.log("[PageNavigationListener] Observer successfully attached to .mx-placeholder");
            } else {
                // Placeholder not found yet, retry up to 10 times (5 seconds total)
                if (retryCount < 10) {
                    console.log(
                        `[PageNavigationListener] .mx-placeholder not found, retrying... (${retryCount + 1}/10)`
                    );
                    setTimeout(() => setupObserver(retryCount + 1), 500);
                } else {
                    console.error("[PageNavigationListener] Failed to find .mx-placeholder after 10 attempts");
                }
            }
        };

        // Start observer setup with retry logic
        setupObserver();
        */

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
