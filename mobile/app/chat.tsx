import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, FlatList, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '@/api/chatApi';
import { createChatHub } from '@/services/chatHub';
import { extractError } from '@/api/http';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import type { ChatMessage } from '@/types/models';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function ChatScreen() {
  const { applicationId, jobTitle } = useLocalSearchParams<{ applicationId: string; jobTitle: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const hub = useMemo(() => createChatHub(), []);

  const handleIncoming = useCallback((message: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const history = await chatApi.history(applicationId!);
        if (!cancelled) setMessages(history);
        hub.onMessage(handleIncoming);
        await hub.start();
        await hub.join(applicationId!);
      } catch (err) {
        Alert.alert('Sohbet hatası', extractError(err));
      }
    })();
    return () => {
      cancelled = true;
      hub.leave(applicationId!).catch(() => undefined);
      hub.stop().catch(() => undefined);
    };
  }, [applicationId, hub, handleIncoming]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    try {
      await hub.send(applicationId!, content);
      setDraft('');
    } catch (err) {
      Alert.alert('Gönderim başarısız', extractError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={router.back}
            style={({ pressed }) => [styles.backBtn, pressed && { backgroundColor: colors.primarySoft }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.fg} />
          </Pressable>
          <View style={[styles.headerAvatar, { backgroundColor: colors.accent2 }]}>
            <Text style={styles.headerAvatarText}>
              {initials(jobTitle ?? 'İlan')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{jobTitle}</Text>
            <Text style={styles.headerSub}>çevrimiçi</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          ListHeaderComponent={
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>Bugün</Text>
            </View>
          }
          renderItem={({ item }) => {
            const mine = item.senderId === user?.userId;
            return (
              <View style={[styles.bubbleWrap, mine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  {!mine ? (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                  ) : null}
                  <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                    {item.content}
                  </Text>
                </View>
                <Text style={[styles.bubbleTime, mine ? { textAlign: 'right' } : { textAlign: 'left' }]}>
                  {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />

        {/* Input bar */}
        <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputWrap}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Mesaj yazın…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
              maxLength={1000}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={sending || !draft.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
              pressed && { transform: [{ scale: 0.93 }] },
            ]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 13, fontWeight: '700', color: colors.primaryDeep },
  headerName: { fontSize: 14, fontWeight: '700', color: colors.fg },
  headerSub: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 1 },
  messageList: { padding: 16, paddingBottom: 8, gap: 4 },
  datePill: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 12,
  },
  datePillText: { fontSize: 11, color: colors.muted },
  bubbleWrap: { maxWidth: '80%', marginBottom: 4 },
  bubbleWrapMine: { alignSelf: 'flex-end' },
  bubbleWrapTheirs: { alignSelf: 'flex-start' },
  bubble: { padding: 10, borderRadius: 20 },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderName: { fontSize: 11, fontWeight: '600', color: colors.muted, marginBottom: 2 },
  bubbleText: { fontSize: 13.5, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: colors.fg },
  bubbleTime: { fontSize: 10, color: colors.muted, marginTop: 2, paddingHorizontal: 6 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 42,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: { fontSize: 13.5, color: colors.fg },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  sendBtnDisabled: { opacity: 0.5, transform: [{ scale: 0.92 }] },
});
