import type { QuoteFlowDetails } from './quoteFlow';

type ElevenLabsExtractInput = {
  userMessage: string;
  activeQuestion?: string;
  currentDetails: QuoteFlowDetails;
};

export type ElevenLabsSuggestion = {
  field: string;
  options: string[];
};

export type ElevenLabsTurnResult = {
  extracted: Partial<QuoteFlowDetails> | null;
  assistantMessage: string | null;
  suggestions: ElevenLabsSuggestion | null;
};

export type ElevenLabsRequirementSession = {
  sendUserMessage: (text: string) => boolean;
  close: () => void;
  isOpen: () => boolean;
};

type ElevenLabsSessionHandlers = {
  onTurn: (turn: ElevenLabsTurnResult) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error?: unknown) => void;
};

type AgentJsonResponse = {
  message_for_user?: unknown;
  extracted_details?: unknown;
  suggestion_for_user?: {
    field?: string;
    options?: unknown[];
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeCondition(value: unknown): string {
  const text = String(value ?? '').toLowerCase();
  if (!text) return '';
  if (text.includes('brand') || text.includes('new')) return 'Brand new';
  if (text.includes('pre') || text.includes('used')) return 'Pre-owned';
  return '';
}

function normalizeCoverage(value: unknown): string {
  const text = String(value ?? '').toLowerCase();
  if (!text) return '';
  if (text.includes('third')) return 'Third Party';
  if (text.includes('comp')) return 'Comprehensive';
  return '';
}

function normalizeSpec(value: unknown): string {
  const text = String(value ?? '').toLowerCase();
  if (!text) return '';
  if (text.includes('non') || text.includes('import')) return 'Non-GCC';
  if (text.includes('gcc')) return 'GCC';
  return '';
}

function normalizeYear(value: unknown): string {
  const text = String(value ?? '').trim();
  const match = text.match(/\b(19\d{2}|20\d{2})\b/);
  return match?.[1] ?? '';
}

function normalizeNoClaimProof(value: unknown): string {
  const text = String(value ?? '').toLowerCase();
  if (!text) return '';
  if (text === 'true' || text.includes('yes') || text.includes('have')) return 'Yes';
  if (text === 'false' || text.includes('no')) return 'No';
  return '';
}

function normalizeKeyedExtraction(raw: Record<string, unknown>): Partial<QuoteFlowDetails> {
  const get = (...keys: string[]) => keys.map((k) => raw[k]).find((v) => v !== undefined && v !== null);

  return {
    brand: String(get('brand', 'make', 'car_make') ?? '').trim(),
    model: String(get('model', 'car_model') ?? '').trim(),
    year: normalizeYear(get('year', 'model_year', 'car_year')),
    condition: normalizeCondition(get('condition', 'is_brand_new', 'brand_new')),
    coverage: normalizeCoverage(get('coverage', 'previous_insurance_repair_type', 'repair_type')),
    spec: normalizeSpec(get('spec', 'gcc', 'gcc_spec')),
    city: String(get('city', 'registration_city', 'emirate') ?? '').trim(),
    expiry: String(get('expiry', 'previous_insurance_expired', 'insurance_expiry') ?? '').trim(),
    name: String(get('name', 'owner_name', 'full_name') ?? '').trim(),
    dob: String(get('dob', 'date_of_birth', 'birth_date') ?? '').trim(),
    nationality: String(get('nationality') ?? '').trim(),
    drivingExperience: String(get('drivingExperience', 'driving_experience') ?? '').trim(),
    accidentFreeMonths: String(get('accidentFreeMonths', 'months_without_accident', 'claim_free_period') ?? '').trim(),
    noClaimProof: normalizeNoClaimProof(get('noClaimProof', 'no_claim_proof')),
    mobileNumber: String(get('mobileNumber', 'mobile', 'mobile_number', 'phone') ?? '').trim(),
  };
}

function tryParseJsonBlob(text: string): Record<string, unknown> | null {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first < 0 || last <= first) return null;
  const candidate = text.slice(first, last + 1);
  try {
    const parsed = JSON.parse(candidate);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function findStructuredPayload(payload: unknown): Record<string, unknown> | null {
  if (!payload) return null;
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    const objectPayload = payload as Record<string, unknown>;
    const direct = normalizeKeyedExtraction(objectPayload);
    if (Object.values(direct).some(Boolean)) return objectPayload;

    for (const value of Object.values(objectPayload)) {
      const nested = findStructuredPayload(value);
      if (nested) return nested;
    }
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = findStructuredPayload(item);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof payload === 'string') {
    return tryParseJsonBlob(payload);
  }

  return null;
}

function normalizeDataCollectionResults(payload: unknown): Record<string, unknown> | null {
  const root = asRecord(payload);
  if (!root) return null;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(root)) {
    if (value === undefined || value === null) continue;
    const nested = asRecord(value);
    if (nested) {
      if (nested.value !== undefined && nested.value !== null) {
        out[key] = nested.value;
        continue;
      }
      if (nested.collected_value !== undefined && nested.collected_value !== null) {
        out[key] = nested.collected_value;
        continue;
      }
      if (nested.answer !== undefined && nested.answer !== null) {
        out[key] = nested.answer;
        continue;
      }
    }
    out[key] = value;
  }

  return Object.keys(out).length ? out : null;
}

async function getSignedConversationUrl(args: {
  baseUrl: string;
  apiKey: string;
  agentId: string;
}): Promise<string | null> {
  try {
    const signedUrlRes = await fetch(
      `${args.baseUrl}/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(args.agentId)}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': args.apiKey,
        },
      }
    );

    if (!signedUrlRes.ok) return null;
    const signedUrlJson = asRecord(await signedUrlRes.json());
    const signedUrl = String(signedUrlJson?.signed_url ?? '').trim();
    return signedUrl || null;
  } catch {
    return null;
  }
}

function getAgentResponseText(eventPayload: Record<string, unknown>): string | null {
  const direct =
    String(
      eventPayload.agent_response
      ?? asRecord(eventPayload.agent_response_event)?.agent_response
      ?? asRecord(eventPayload.agent_response_correction_event)?.corrected_agent_response
      ?? asRecord(eventPayload.agent_response_event)?.text
      ?? eventPayload.text
      ?? ''
    ).trim();
  return direct || null;
}

function parseAgentTurn(rawMessage: string): ElevenLabsTurnResult {
  const parsedMessageJson = tryParseJsonBlob(rawMessage) as AgentJsonResponse | null;
  const assistantMessageFromJson = String(parsedMessageJson?.message_for_user ?? '').trim();
  const assistantMessage = assistantMessageFromJson || rawMessage.trim();

  // Extract suggestions
  const suggestionRaw = parsedMessageJson?.suggestion_for_user;
  const suggestions: ElevenLabsSuggestion | null =
    suggestionRaw?.field && Array.isArray(suggestionRaw?.options) && suggestionRaw.options.length > 0
      ? {
          field: String(suggestionRaw.field),
          options: suggestionRaw.options.map((o) => String(o)).filter(Boolean),
        }
      : null;

  const structured = normalizeDataCollectionResults(parsedMessageJson?.extracted_details)
    ?? findStructuredPayload(parsedMessageJson);
  if (!structured) return { extracted: null, assistantMessage, suggestions };

  const normalized = normalizeKeyedExtraction(structured);
  return {
    extracted: Object.values(normalized).some(Boolean) ? normalized : null,
    assistantMessage,
    suggestions,
  };
}

async function createRealtimeSession(handlers: ElevenLabsSessionHandlers): Promise<ElevenLabsRequirementSession | null> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
  const explicitBaseUrl = import.meta.env.VITE_ELEVENLABS_BASE_URL as string | undefined;
  const forceDirectInDev = String(import.meta.env.VITE_ELEVENLABS_FORCE_DIRECT_IN_DEV ?? '').toLowerCase() === 'true';
  const baseUrl = import.meta.env.DEV && !forceDirectInDev
    ? '/api/elevenlabs'
    : (explicitBaseUrl || 'https://api.elevenlabs.io');
  const debug = Boolean(import.meta.env.DEV);

  if (!apiKey || !agentId) return null;

  const signedSocketUrl = await getSignedConversationUrl({ baseUrl, apiKey, agentId });
  if (!signedSocketUrl) return null;

  let closed = false;
  let ws: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let reconnectAttempts = 0;
  const pendingMessages: string[] = [];
  let awaitingUserReply = false;
  let ignoredInitialGreeting = false;

  const sendFrame = (frame: Record<string, unknown>) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (debug && frame.type === 'user_message') {
      console.log('[ElevenLabs][OUT message]', String(frame.text ?? '').trim());
    }
    ws.send(JSON.stringify(frame));
  };

  const flushPending = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (pendingMessages.length > 0) {
      const text = pendingMessages.shift();
      if (!text) continue;
      sendFrame({ type: 'user_message', text });
      awaitingUserReply = true;
    }
  };

  const scheduleReconnect = () => {
    if (closed || reconnectTimer !== null) return;
    const delay = Math.min(3000, 400 * (reconnectAttempts + 1));
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      reconnectAttempts += 1;
      connect();
    }, delay);
  };

  const connect = () => {
    if (closed) return;
    ws = new WebSocket(signedSocketUrl);

    ws.onopen = () => {
      if (closed || !ws || ws.readyState !== WebSocket.OPEN) return;
      reconnectAttempts = 0;
      sendFrame({ type: 'conversation_initiation_client_data' });
      handlers.onOpen?.();
      flushPending();
    };

    ws.onmessage = (event) => {
      let parsed: unknown = null;
      if (typeof event.data === 'string') {
        try {
          parsed = JSON.parse(event.data);
        } catch {
          parsed = null;
        }
      }
      const payload = asRecord(parsed);
      if (!payload) return;

      const eventType = String(payload.type ?? '');

      if (eventType === 'ping') {
        const pingEvent = asRecord(payload.ping_event);
        if (ws && ws.readyState === WebSocket.OPEN) {
          sendFrame({ type: 'pong', event_id: pingEvent?.event_id });
        }
        return;
      }

      if (eventType === 'conversation_initiation_metadata') {
        flushPending();
        return;
      }

      if (eventType !== 'agent_response' && eventType !== 'agent_response_correction') return;

      const text = getAgentResponseText(payload);
      if (!text) return;
      if (debug) console.log('[ElevenLabs][IN message]', text);

      // Allow exactly one greeting before any user turn, ignore any further unsolicited messages.
      if (!awaitingUserReply) {
        if (!ignoredInitialGreeting) {
          ignoredInitialGreeting = true;
          handlers.onTurn(parseAgentTurn(text));
        }
        return;
      }

      awaitingUserReply = false;
      handlers.onTurn(parseAgentTurn(text));
    };

    ws.onerror = (error) => {
      if (debug) console.warn('[ElevenLabs] websocket error');
      handlers.onError?.(error);
    };

    ws.onclose = (event) => {
      if (debug) {
        console.warn('[ElevenLabs] websocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
      }
      handlers.onClose?.();
      if (!closed) scheduleReconnect();
    };
  };
  connect();

  return {
    sendUserMessage(text: string) {
      const trimmed = text.trim();
      if (!trimmed || closed) return false;
      if (ws && ws.readyState === WebSocket.OPEN) {
        sendFrame({ type: 'user_message', text: trimmed });
        awaitingUserReply = true;
        return true;
      }
      pendingMessages.push(trimmed);
      if (debug) console.log('[ElevenLabs][QUEUE]', trimmed);
      if (!ws || ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
        connect();
      }
      return true;
    },
    close() {
      if (closed) return;
      closed = true;
      pendingMessages.length = 0;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    },
    isOpen() {
      return Boolean(ws && ws.readyState === WebSocket.OPEN);
    },
  };
}

export async function startElevenLabsRequirementSession(
  handlers: ElevenLabsSessionHandlers
): Promise<ElevenLabsRequirementSession | null> {
  try {
    return await createRealtimeSession(handlers);
  } catch (error) {
    handlers.onError?.(error);
    return null;
  }
}

async function runRealtimeTurn(args: {
  socketUrl: string;
  userMessage: string;
  timeoutMs: number;
  debug?: boolean;
}): Promise<string | null> {
  return new Promise((resolve) => {
    const ws = new WebSocket(args.socketUrl);
    let settled = false;
    let userMessageSent = false;
    let sawUserTranscript = false;
    let bufferedFirstAgentResponse: string | null = null;

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      resolve(value);
    };

    const sendUserMessage = () => {
      if (userMessageSent || ws.readyState !== WebSocket.OPEN) return;
      userMessageSent = true;
      ws.send(JSON.stringify({ type: 'user_message', text: args.userMessage }));
    };

    const timeout = window.setTimeout(() => finish(bufferedFirstAgentResponse), args.timeoutMs);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'conversation_initiation_client_data' }));
    };

    ws.onmessage = (event) => {
      let parsed: unknown = null;
      if (typeof event.data === 'string') {
        try {
          parsed = JSON.parse(event.data);
        } catch {
          parsed = null;
        }
      }
      const payload = asRecord(parsed);
      if (!payload) return;

      const eventType = String(payload.type ?? '');

      if (eventType === 'ping') {
        const pingEvent = asRecord(payload.ping_event);
        ws.send(JSON.stringify({ type: 'pong', event_id: pingEvent?.event_id }));
        return;
      }

      if (eventType === 'conversation_initiation_metadata') {
        sendUserMessage();
        return;
      }

      if (eventType === 'user_transcript') {
        sawUserTranscript = true;
        return;
      }

      if (eventType === 'agent_response' || eventType === 'agent_response_correction') {
        const text = getAgentResponseText(payload);
        if (!text) return;

        // Ignore configured greeting before our user turn is acknowledged.
        if (!sawUserTranscript && !bufferedFirstAgentResponse) {
          bufferedFirstAgentResponse = text;
          return;
        }
        finish(text);
      }
    };

    ws.onerror = () => {
      if (args.debug) console.warn('[ElevenLabs] websocket error');
      finish(null);
    };
    ws.onclose = (event) => {
      if (args.debug) {
        console.warn('[ElevenLabs] websocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
      }
      finish(null);
    };
  });
}

export async function runElevenLabsRequirementTurn(
  input: ElevenLabsExtractInput
): Promise<ElevenLabsTurnResult> {
  const firstMessage = input.userMessage.trim();
  if (!firstMessage) return { extracted: null, assistantMessage: null, suggestions: null };

  // Backward-compatible single-turn helper using one short-lived socket turn.
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
  const explicitBaseUrl = import.meta.env.VITE_ELEVENLABS_BASE_URL as string | undefined;
  const forceDirectInDev = String(import.meta.env.VITE_ELEVENLABS_FORCE_DIRECT_IN_DEV ?? '').toLowerCase() === 'true';
  const baseUrl = import.meta.env.DEV && !forceDirectInDev
    ? '/api/elevenlabs'
    : (explicitBaseUrl || 'https://api.elevenlabs.io');
  if (!apiKey || !agentId) return { extracted: null, assistantMessage: null, suggestions: null };

  const signedSocketUrl = await getSignedConversationUrl({ baseUrl, apiKey, agentId });
  if (!signedSocketUrl) return { extracted: null, assistantMessage: null, suggestions: null };

  const assistantRaw = await runRealtimeTurn({
    socketUrl: signedSocketUrl,
    userMessage: firstMessage,
    timeoutMs: import.meta.env.DEV ? 20000 : 12000,
    debug: Boolean(import.meta.env.DEV),
  });
  if (!assistantRaw) return { extracted: null, assistantMessage: null, suggestions: null };
  return parseAgentTurn(assistantRaw);
}

export async function extractRequirementDetailsWithElevenLabs(
  input: ElevenLabsExtractInput
): Promise<Partial<QuoteFlowDetails> | null> {
  const result = await runElevenLabsRequirementTurn(input);
  return result.extracted;
}
