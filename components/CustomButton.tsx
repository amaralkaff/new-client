// components/CustomButton.tsx
import React from "react";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  mode?: "text" | "outlined" | "contained";
  style?: object;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  mode = "contained",
  style,
}) => {
  return (
    <Button mode={mode} onPress={onPress} style={[styles.button, style]}>
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ee8b60",
  },
});

export default CustomButton;
