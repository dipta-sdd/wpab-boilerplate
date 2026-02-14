// src/utils/apiFetch.ts

import apiFetch from "@wordpress/api-fetch";
import { BoilerplateStore } from "./types";

declare global {
  interface Window {
    /**
     * The main data object localized from PHP by wp_localize_script.
     */
    wpabBoilerplate_Localize?: BoilerplateStore;
  }
}
// Get the nonce and root URL that we localized from PHP.
const { nonce, rest_url } = window?.wpabBoilerplate_Localize || {};
if (nonce) apiFetch.use(apiFetch.createNonceMiddleware(nonce));
if (rest_url) apiFetch.use(apiFetch.createRootURLMiddleware(rest_url));
