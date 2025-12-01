import { ReactElement, createElement } from "react";
import { PageNavigationListenerPreviewProps } from "../typings/PageNavigationListenerProps";

export function preview(_props: PageNavigationListenerPreviewProps): ReactElement {
    return (
        <div className="widget-page-navigation-listener-preview">
            <div className="preview-placeholder">
                📍 Page Navigation Listener
                <small>Triggers action on page navigation</small>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/PageNavigationListener.css");
}
