import { Tabs } from "expo-router";
import { Navigation } from "@/components";

const _Layout = () => {
  return (
    <Tabs
      tabBar={(props) => <Navigation {...props}/>}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }}/>
      <Tabs.Screen name="search" options={{ title: "Search" }}/>
      <Tabs.Screen name="add-food" options={{ title: "Add Food" }}/>
      <Tabs.Screen name="groups" options={{ title: "Groups" }}/>
      <Tabs.Screen name="profile" options={{ title: "Profile" }}/>
      <Tabs.Screen name="quick-add" options={{ href: null }}/>
    </Tabs>
  );
};
export default _Layout;