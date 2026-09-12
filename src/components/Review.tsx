import { Text, View } from "react-native";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import type { ReviewItem } from "@/lib/types";
import { StarIcon } from "./icons/StarIcon";

/** Ports ui/Review.jsx — a single review card in the horizontal reviews row. */
export default function Review({ review }: { review: ReviewItem }) {
  const content = review.content
    .replace(/<[^>]*>/g, "")
    .replace(/\n|\t/g, " ")
    .trim();
  const author = review.author || review.author_details?.name || "Anonymous";
  const rating = review.author_details?.rating;

  return (
    <View className="h-48 w-72 shrink-0 justify-between rounded-xl border p-3" style={{ borderColor: colors.muted }}>
      <View className="gap-1">
        <Text style={{ color: colors.rating, fontFamily: fonts.body }} className="text-right text-xs">
          {review.updated_at?.split("T")[0]}
        </Text>
        <Text numberOfLines={5} style={{ color: colors.text, fontFamily: fonts.body }} className="text-sm">
          {content}
        </Text>
      </View>
      <View className="flex-row items-center justify-between border-t pt-2" style={{ borderColor: colors.muted }}>
        <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-xs">
          By <Text style={{ color: colors.text, fontFamily: fonts.body }}>{author}</Text>
        </Text>
        {rating != null ? (
          <View className="flex-row items-center gap-1">
            <StarIcon size={10} />
            <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-xs">
              {rating}/10
            </Text>
          </View>
        ) : (
          <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-xs">
            no rating
          </Text>
        )}
      </View>
    </View>
  );
}
