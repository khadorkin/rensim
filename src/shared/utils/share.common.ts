// @ts-ignore
import * as share from "./share";

export const fetchRemoteMedia: (url: string, extension: string) => Promise<string> = share.fetchRemoteMedia;
export const openShare: (url: string | null, message: string | null) => Promise<any> = share.openShare;