import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Button } from '@/components/Button';
import { chatApi } from '@/api/chatApi';
import { createChatHub } from '@/services/chatHub';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { ChatMessage } from '@/types/models';

interface Props {
  route: { params: { applicationId: string; jobTitle: string } };
  navigation: { goBack: () => void };
}

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { applicationId, jobTitle } = route.params;
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const hub = useMemo(() => createChatHub(), []);
  const headerHeight = useHeaderHeight();

  const handleIncoming = useCallback((message: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const history = await chatApi.history(applicationId);
        if (!cancelled) setMessages(history);
        hub.onMessage(handleIncoming);
        await hub.start();
        await hub.join(applicationId);
      } catch (err) {
        Alert.alert('Sohbet hatası', extractError(err));
      }
    })();
    return () => {
      cancelled = true;
      hub.leave(applicationId).catch(() => undefined);
      hub.stop().catch(() => undefined);
    };
  }, [applicationId, hub, handleIncoming]);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    try {
      await hub.send(applicationId, content);
      setDraft('');
    } catch (err) {
      Alert.alert('Gönderim başarısız', extractError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.userId;
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {!mine ? <Text style={styles.senderName}>{item.senderName}</Text> : null}
                <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                  {item.content}
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Mesaj yazın..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Button title="Gönder" onPress={handleSend} loading={sending} style={styles.sendButton} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  list: { padding: 16, paddingBottom: 24 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 14, marginBottom: 8 },
  bubbleMine: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  senderName: { fontSize: 11, fontWeight: '600', color: colors.textMuted, marginBottom: 2 },
  bubbleText: { fontSize: 15 },
  bubbleTextMine: { color: '#FFF' },
  bubbleTextTheirs: { color: colors.text },
  composer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendButton: { marginLeft: 8, paddingHorizontal: 18 },
});
