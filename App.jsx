import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Animated,
  Image,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import LinearGradient from "react-native-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";

// ======== THEME CONTEXT =========
const themes = {
  light: { background: "#f4f4f4", text: "#000", card: "#fff", primary: "#383a3dff" },
  dark: { background: "#1c1c1c", text: "#fff", card: "#2c2c2c", primary: "#031432ff" },
};
const ThemeContext = createContext();
function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <ThemeContext.Provider
      value={{
        theme: darkMode ? themes.dark : themes.light,
        darkMode,
        toggleTheme: () => setDarkMode(!darkMode),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
function useTheme() {
  return useContext(ThemeContext);
}

// ======== SPLASH =========
function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    setTimeout(() => navigation.replace("Login"), 2000);
  }, []);
  return (
    <LinearGradient
      colors={theme === themes.dark ? ["#0f2027", "#203a43", "#2c5364"] : ["#363636ff", "#cfd5e1ff"]}
      style={styles.container}
    >
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <Image
          source={{ uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" }}
          style={{ width: 150, height: 150, marginBottom: 20 }}
        />
        <Text style={[styles.logo, { color: "#fff" }]}>MyCrypto Wallet</Text>
      </Animated.View>
    </LinearGradient>
  );
}

// ======== LOGIN =========
function LoginScreen({ navigation, route }) {
  const { theme } = useTheme();
  const registeredUser = route.params?.registeredUser;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!registeredUser) return Alert.alert("No Account", "Please sign up first!");
    if (email === registeredUser.email && password === registeredUser.password) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "DrawerHome",
            params: { username: registeredUser.name || "User", wallet: registeredUser.wallet },
          },
        ],
      });
    } else Alert.alert("Invalid Credentials", "Email or Password is incorrect");
  };

  return (
    <SafeAreaView style={[styles.signupContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.signupTitle, { color: theme.text }]}>Login</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.signupButton, { backgroundColor: theme.primary }]}
        onPress={handleLogin}
      >
        <Text style={styles.signupButtonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={{ color: theme.primary, marginTop: 15 }}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ======== SIGNUP =========
function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    const wallet = "0x" + Math.random().toString(16).substr(2, 16).toUpperCase();
    navigation.navigate("Login", { registeredUser: { name, email, password, wallet } });
  };

  return (
    <SafeAreaView style={[styles.signupContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.signupTitle, { color: theme.text }]}>Create Account</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.signupButton, { backgroundColor: theme.primary }]}
        onPress={handleSignup}
      >
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={{ color: theme.primary, marginTop: 15 }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ======== COINS =========
const initialCoins = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    data: [50, 80, 60, 90, 100, 80],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    data: [30, 40, 50, 70, 60, 90],
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    data: [20, 40, 20, 80, 60, 50],
  },
];

function CoinsScreen({ navigation }) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [coins, setCoins] = useState(initialCoins);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
    Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
  }, []);

  const fetchPrices = async () => {
    try {
      const ids = coins.map((c) => c.id).join(",");
      const res = await axios.get(
        https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd
      );

      const totalBudget = 403;
      const equalBudget = totalBudget / coins.length;

      const updated = coins.map((coin) => {
        const price = res.data[coin.id]?.usd || 0;
        const amountOwned = price ? equalBudget / price : 0;
        return { ...coin, price, amountOwned, totalValue: equalBudget.toFixed(2) };
      });

      setCoins(updated);
    } catch (error) {
      console.log("Error fetching prices", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <Text style={{ color: theme.text, fontSize: 18 }}>Loading Prices...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, color: theme.text }}>Balance</Text>
        <Text style={{ fontSize: 32, fontWeight: "bold", color: theme.text }}>$403</Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={coins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.coinCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate("CryptoDetails", { coin: item })}
            >
              <Image source={{ uri: item.image }} style={{ width: 40, height: 40, marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.coinName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.coinPrice, { color: theme.text }]}>
                  {item.amountOwned.toFixed(6)} {item.symbol} (${item.totalValue})
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

function CryptoDetailsScreen({ route }) {
  const { theme } = useTheme();
  const { coin } = route.params;
  const screenWidth = Dimensions.get("window").width - 30;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 15 }}>
      <Text style={[styles.portfolioTitle, { color: theme.text }]}>{coin.name}</Text>
      <Text style={[styles.balance, { color: theme.text }]}>Price: ${coin.price}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: ["Tue", "Wed", "Thu", "Fri", "Sat", "Mon"],
            datasets: [{ data: coin.data }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            color: () => theme.primary,
            strokeWidth: 3,
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ======== DRAWER CONTENT =========
function CustomDrawerContent(props) {
  const { username, wallet } = props;
  const initials = username ? username.charAt(0).toUpperCase() : "U";
  return (
    <DrawerContentScrollView {...props}>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#4c8bf5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28, color: "#fff", fontWeight: "bold" }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>{username}</Text>
        <Text style={{ fontSize: 14, marginVertical: 5 }}>{wallet}</Text>
      </View>
      <DrawerItem label="Update Profile" onPress={() => Alert.alert("Update Profile")} />
      <DrawerItem label="Logout" onPress={() => props.navigation.replace("Login")} />
    </DrawerContentScrollView>
  );
}

// ======== NAVIGATION =========
const Drawer = createDrawerNavigator();
function DrawerHome({ route }) {
  const { username, wallet } = route.params;
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} username={username} wallet={wallet} />}
    >
      <Drawer.Screen
        name="Coins"
        component={CoinsScreen}
        options={{ title: "My Portfolio" }} 
      />
    </Drawer.Navigator>
  );
}

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DrawerHome" component={DrawerHome} options={{ headerShown: false }} />
          <Stack.Screen name="CryptoDetails" component={CryptoDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

// ======== STYLES =========
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { fontSize: 32, fontWeight: "bold", marginBottom: 50 },
  signupContainer: { flex: 1, padding: 20, justifyContent: "center" },
  signupTitle: { fontSize: 26, fontWeight: "bold", marginVertical: 20, textAlign: "center" },
  input: { borderRadius: 8, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: "#ddd" },
  signupButton: { paddingVertical: 15, marginTop: 20, borderRadius: 8, alignItems: "center" },
  signupButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  portfolioTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  balance: { fontSize: 20, marginBottom: 20, fontWeight: "bold" },
  coinCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  coinName: { fontSize: 18, fontWeight: "600" },
  coinPrice: { fontSize: 16 },
});