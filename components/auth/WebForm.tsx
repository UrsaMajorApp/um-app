// WebForm: на web оборачивает auth-поля в настоящий <form>,
// чтобы браузер не ругался на password input без form-родителя.
import type React from 'react';
import { Platform, View } from 'react-native';

interface WebFormProps {
  children: React.ReactNode;
  onSubmit?: () => void;
}

export function WebForm({ children, onSubmit }: WebFormProps) {
  if (Platform.OS !== 'web') {
    return <View>{children}</View>;
  }

  return (
    <form
      autoComplete="on"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      style={{ display: 'contents' }}
    >
      {children}
    </form>
  );
}
