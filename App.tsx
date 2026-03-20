import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from './src/theme/colors';
import { sharedStyles } from './src/theme/styles';
import { HomeScreen } from './src/screens/HomeScreen';
import { MarchScreen } from './src/screens/MarchScreen';
import { TBIScreen } from './src/screens/TBIScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { RecentPatientsScreen } from './src/screens/RecentPatientsScreen';
import { VoiceAssessmentScreen } from './src/screens/VoiceAssessmentScreen';

export type RootStackParamList = {
  Home: undefined;
  March: undefined;
  TBI: undefined;
  Review: undefined;
  Confirm: undefined;
  RecentPatients: undefined;
  VoiceAssessment: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={sharedStyles.screen}>
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.accent,
          background: colors.bg,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="March" component={MarchScreen} />
        <Stack.Screen name="TBI" component={TBIScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} />
        <Stack.Screen name="RecentPatients" component={RecentPatientsScreen} />
        <Stack.Screen name="VoiceAssessment" component={VoiceAssessmentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
