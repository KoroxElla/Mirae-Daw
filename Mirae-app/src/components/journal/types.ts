export interface JournalEntry {
  id: string;
  text: string;
  createdAt: Date;
  weights?: Record<string, number>;
  arbitration?: {
    mode: string;
    emotions: string[];
    animations: string[];
  };
}

export interface JournalSettings {
  title: string;
  cover: string;
  updatedAt?: Date;
}

export interface JournalState {
  entries: JournalEntry[];
  settings: JournalSettings;
  currentPage: number;
  isEditing: boolean;
  editingEntry: JournalEntry | null;
  isLoading: boolean;
}
