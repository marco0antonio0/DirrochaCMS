export const ADMIN_BASE_PATH = "/cms-admin";

export const adminPath = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${ADMIN_BASE_PATH}${normalizedPath === "/" ? "" : normalizedPath}`;
};
