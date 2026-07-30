import { Animated, Easing } from 'react-native';

const ScannerOverlay = () => {
  const scanAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 200, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-black/50">
      <View className="w-64 h-64 border-2 border-white/20 rounded-3xl relative overflow-hidden items-center justify-center">
        {/* Coins dorés du cadre */}
        <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#fcd116] rounded-tl-xl" />
        <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#fcd116] rounded-tr-xl" />
        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#fcd116] rounded-bl-xl" />
        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#fcd116] rounded-br-xl" />
        
        {/* Ligne Laser Animée */}
        <Animated.View
          style={{ transform: [{ translateY: scanAnim }] }}
          className="w-full h-1 bg-[#fcd116] shadow-lg shadow-[#fcd116]"
        />
      </View>
      <Text className="text-white/80 font-bold text-xs mt-6 bg-black/60 px-4 py-2 rounded-full">
        Positionnez le QR Code dans le cadre
      </Text>
    </View>
  );
};
