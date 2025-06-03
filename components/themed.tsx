import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
  TouchableOpacity as DefaultTouchableOpacity,
  ScrollView as DefaultScrollView,
} from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"

type ThemeProps = {
  lightColor?: string
  darkColor?: string
}

export type TextProps = ThemeProps & DefaultText["props"]
export type ViewProps = ThemeProps & DefaultView["props"]
export type TextInputProps = ThemeProps & DefaultTextInput["props"]
export type TouchableOpacityProps = ThemeProps & DefaultTouchableOpacity["props"]
export type ScrollViewProps = ThemeProps & DefaultScrollView["props"]

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text")

  return <DefaultText style={[{ color }, style]} {...otherProps} />
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background")

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text")
  const backgroundColor = useThemeColor({ light: "#F0F0F0", dark: "#333333" }, "background")
  const placeholderColor = useThemeColor({ light: "#9BA1A6", dark: "#687076" }, "icon")

  return (
    <DefaultTextInput
      style={[
        {
          color,
          backgroundColor,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
        },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...otherProps}
    />
  )
}

export function Button({
  style,
  lightColor,
  darkColor,
  textStyle,
  children,
  ...otherProps
}: TouchableOpacityProps & { textStyle?: TextProps["style"] }) {
  const backgroundColor = useThemeColor({ light: lightColor || "#0a7ea4", dark: darkColor || "#0a7ea4" }, "tint")

  return (
    <DefaultTouchableOpacity
      style={[
        {
          backgroundColor,
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      {...otherProps}
    >
      {typeof children === "string" ? (
        <Text style={[{ color: "white", fontWeight: "bold", fontSize: 16 }, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </DefaultTouchableOpacity>
  )
}

export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background")

  return <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />
}

export function Card(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#1E1E1E" }, "background")
  const borderColor = useThemeColor({ light: "#E0E0E0", dark: "#333333" }, "icon")

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor,
        },
        style,
      ]}
      {...otherProps}
    />
  )
}
