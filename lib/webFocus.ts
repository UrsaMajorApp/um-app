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
}
