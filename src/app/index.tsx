import { ScrollView } from "react-native";
import HeaderCarousel from "@/components/HeaderCarousel";
import HomeSection from "@/components/HomeSection";
import TrendingSection from "@/components/TrendingSection";
import { colors } from "@/constants/theme";

/** Ports Components/pages/Home.jsx. */
export default function HomeScreen() {
      return (
            <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ gap: 24, paddingBottom: 100 }}>
                  <HeaderCarousel />
                  <TrendingSection />
                  <HomeSection path="movie/upcoming?page=1" title="Upcoming Movies" />
                  <HomeSection path="discover/tv?include_adult=true&include_video=true&language=en-US&page=1&sort_by=popularity.desc" title="Now Playing TV Series" />
                  <HomeSection path="movie/top_rated" title="Top Rated Movies" />
                  <HomeSection path="search/multi?query=animated" title="Animated" />
            </ScrollView>
      );
}
