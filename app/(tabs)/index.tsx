import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import SOSButton from '../../components/SOSButton';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <SOSButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
