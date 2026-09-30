import { forwardRef, type ComponentRef } from "react";
import { Pressable, type PressableProps } from "react-native";
import { playSound, type InteractionCue, type InteractionOptions } from "@/lib/interactionSounds";

type SoundPressableProps = PressableProps & {
      sound?: InteractionCue;
      soundDirection?: InteractionOptions["direction"];
};

export const SoundPressable = forwardRef<ComponentRef<typeof Pressable>, SoundPressableProps>(function SoundPressable({ sound = "tap", soundDirection, onPress, ...props }, ref) {
      return (
            <Pressable
                  {...props}
                  ref={ref}
                  onPress={(event) => {
                        if (onPress) playSound(sound, { direction: soundDirection });
                        onPress?.(event);
                  }}
            />
      );
});
