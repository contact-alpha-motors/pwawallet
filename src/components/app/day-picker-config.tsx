"use client";

import { fr } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';

// Set default props for react-day-picker
DayPicker.defaultProps = {
  locale: fr,
};

// This component doesn't render anything. It's just a place
// to apply the default props on the client side.
export function DayPickerConfig() {
  return null;
}
