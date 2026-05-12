// Web focus helper: снимает фокус с активного input перед навигацией на web.
import { Platform } from 'react-native';

export function blurActiveWebElement() {
  if (
    Platform.OS !== 'web' ||
    typeof document === 'undefined' ||
    typeof HTMLElement === 'undefined'
  ) {
    return;
  }

  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }

  const previousTabIndex = document.body.getAttribute('tabindex');
  document.body.setAttribute('tabindex', '-1');
  document.body.focus({ preventScroll: true });

  if (previousTabIndex === null) {
    document.body.removeAttribute('tabindex');
    return;
  }

  document.body.setAttribute('tabindex', previousTabIndex);
}
