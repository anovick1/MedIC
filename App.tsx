import React, { useEffect } from "react";
import { loadModel } from "./src/ai/modelManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { colors } from "./src/theme/colors";
import { sharedStyles } from "./src/theme/styles";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AssessmentModeScreen } from "./src/screens/AssessmentModeScreen";
import { PatientInfoScreen } from "./src/screens/PatientInfoScreen";
import { MARCHScreen } from "./src/screens/MARCHScreen";
import { MARCH2Screen } from "./src/screens/MARCH2Screen";
import { TriageFormScreen } from "./src/screens/TriageFormScreen";
import { ReviewDataScreen } from "./src/screens/ReviewDataScreen";
import { ConfirmScreen } from "./src/screens/ConfirmScreen";
import { InteractiveCareScreen } from "./src/screens/InteractiveCareScreen";
import { DraftsScreen } from "./src/screens/DraftsScreen";
import { RecentRequestsScreen } from "./src/screens/RecentRequestsScreen";
import { VoiceAssessmentScreen } from "./src/screens/VoiceAssessmentScreen";

export type RootStackParamList = {
  Home: undefined;
  AssessmentMode: undefined;
  PatientInfo: undefined;
  MARCH: undefined;
  MARCH2: undefined;
  TriageForm: { page: number };
  ReviewData: undefined;
  Confirm: undefined;
  InteractiveCare: undefined;
  Drafts: undefined;
  RecentPatients: undefined;
  VoiceAssessment: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  useEffect(() => {
    loadModel();
  }, []);

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
          <Stack.Screen
            name="AssessmentMode"
            component={AssessmentModeScreen}
          />
          <Stack.Screen name="PatientInfo" component={PatientInfoScreen} />
          <Stack.Screen name="MARCH" component={MARCHScreen} />
          <Stack.Screen name="MARCH2" component={MARCH2Screen} />
          <Stack.Screen name="TriageForm" component={TriageFormScreen} />
          <Stack.Screen name="ReviewData" component={ReviewDataScreen} />
          <Stack.Screen name="Confirm" component={ConfirmScreen} />
          <Stack.Screen
            name="InteractiveCare"
            component={InteractiveCareScreen}
          />
          <Stack.Screen name="Drafts" component={DraftsScreen} />
          <Stack.Screen
            name="RecentPatients"
            component={RecentRequestsScreen}
          />
          <Stack.Screen
            name="VoiceAssessment"
            component={VoiceAssessmentScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
