import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '$constants/theme';

export function LabeledTextInput({
  label,
  inputStyle,
  ...props
}: TextInputProps & {
  label: string;
  inputStyle?: TextInputProps['style'];
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 10,
          fontWeight: TYPOGRAPHY.weight.bold,
          color: COLORS.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={COLORS.mutedForeground}
        {...props}
        style={[
          {
            height: 56,
            backgroundColor: COLORS.background,
            borderRadius: RADIUS.lg,
            paddingHorizontal: 16,
            fontSize: 16,
            fontWeight: TYPOGRAPHY.weight.medium,
            color: COLORS.foreground,
            borderWidth: 1,
            borderColor: COLORS.border,
          },
          inputStyle,
          props.style,
        ]}
      />
    </View>
  );
}
