const AUTH_UNAUTHORIZED_EVENT =
  "auth:unauthorized";

export function notifyUnauthorized() {
  window.dispatchEvent(
    new Event(AUTH_UNAUTHORIZED_EVENT)
  );
}

export function onUnauthorized(
  callback: () => void
) {
  window.addEventListener(
    AUTH_UNAUTHORIZED_EVENT,
    callback
  );

  return () => {
    window.removeEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      callback
    );
  };
}