import { useEffect, useState } from "react";
import { Animated, View } from "react-native";

const AppLoadingSkeleton = () => {
  const [pulse] = useState(() => new Animated.Value(0.3));
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.75, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);
  const bg  = '#FFFFFF12';
  const dim = '#FFFFFF08';
  const bdr = '#FFFFFF10';
  const W   = 362;
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <Animated.View style={{ opacity: pulse, marginTop: 56, alignItems: 'center' }}>
        <View style={{ width: W + 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 16 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: bg }} />
            <View style={{ gap: 6 }}>
              <View style={{ height: 13, width: 110, backgroundColor: dim, borderRadius: 6 }} />
              <View style={{ height: 26, width: 160, backgroundColor: bg, borderRadius: 8 }} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#1D1D1D' }} />
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#1D1D1D' }} />
          </View>
        </View>
        <View style={{ width: W, height: 52, backgroundColor: '#1D1D1D', borderRadius: 999, marginTop: 4 }} />
        <View style={{ width: W, marginTop: 32 }}>
          <View style={{ height: 24, width: 130, backgroundColor: bg, borderRadius: 8 }} />
          <View style={{ backgroundColor: '#FFFFFF08', borderWidth: 1, borderColor: bdr, borderRadius: 20, padding: 24, marginTop: 16, gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ height: 18, width: 100, backgroundColor: bg, borderRadius: 6 }} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bg }} />
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bg }} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 14, height: 14, backgroundColor: dim, borderRadius: 4 }} />
                  <View style={{ width: 36, height: 52, backgroundColor: i === 3 ? bg : dim, borderRadius: 12 }} />
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={{ width: W, marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
            <View style={{ height: 36, width: 110, backgroundColor: '#1D1D1D', borderRadius: 999 }} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#1D1D1D' }} />
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#1D1D1D' }} />
            </View>
          </View>
          <View style={{ backgroundColor: '#1D1D1D', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 40, marginTop: 12, borderWidth: 1, borderColor: bdr }}>
            <View style={{ height: 18, width: 190, backgroundColor: bg, borderRadius: 8, marginBottom: 18 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <View style={{ height: 64, width: 130, backgroundColor: bg, borderRadius: 12, marginBottom: 10 }} />
                <View style={{ height: 17, width: 105, backgroundColor: dim, borderRadius: 6 }} />
              </View>
              <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 12, borderColor: bdr }} />
            </View>
            <View style={{ height: 18, width: 140, backgroundColor: dim, borderRadius: 6, marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', gap: 24 }}>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                  <View style={{ height: 20, width: 52, backgroundColor: bg, borderRadius: 4 }} />
                  <View style={{ height: 8, width: '100%', backgroundColor: dim, borderRadius: 4 }} />
                  <View style={{ height: 15, width: 46, backgroundColor: dim, borderRadius: 4 }} />
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={{ width: W, marginTop: 32 }}>
          <View style={{ height: 24, width: 110, backgroundColor: bg, borderRadius: 8, marginBottom: 16 }} />
          <View style={{ width: '100%', height: 200, backgroundColor: '#C5E38415', borderRadius: 15 }} />
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: pulse, position: 'absolute', bottom: 90, left: 16, right: 16, backgroundColor: '#121212', borderRadius: 40, borderWidth: 1, borderColor: bdr, height: 72, alignItems: 'center', paddingTop: 14 }}>
        <View style={{ width: 40, height: 4, backgroundColor: '#FFFFFF30', borderRadius: 100 }} />
        <View style={{ height: 15, width: 120, backgroundColor: dim, borderRadius: 6, marginTop: 14 }} />
      </Animated.View>
      <Animated.View style={{ opacity: pulse, position: 'absolute', bottom: 32, left: 16, right: 16, backgroundColor: '#1D1D1D', borderRadius: 32, height: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8 }}>
        {[0, 1, 2, 3, 4].map(i =>
          i === 2 ? (
            <View key={i} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#84C75450', marginBottom: 36 }} />
          ) : (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: 24, height: 24, backgroundColor: bg, borderRadius: 6 }} />
            </View>
          )
        )}
      </Animated.View>
    </View>
  );
};
export default AppLoadingSkeleton;