interface OAuthCallbackRequest {
  code: string;
  state: string;
  error?: string;
  error_description?: string;
}

interface OAuthState {
  userId: string;
  connectorId: string;
  redirectUrl: string;
  timestamp: number;
  nonce: string;
}

export async function handleOAuthCallback(
  request: OAuthCallbackRequest,
  provider: string
): Promise<Response> {
  try {
    if (request.error) {
      return new Response(
        JSON.stringify({
          error: request.error,
          description: request.error_description
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!request.code || !request.state) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          description: 'Missing code or state parameter'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const state = validateAndDecodeState(request.state);

    if (!state) {
      return new Response(
        JSON.stringify({
          error: 'invalid_state',
          description: 'Invalid or expired state parameter'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const tokens = await exchangeCodeForTokens(provider, request.code, state);

    if (!tokens) {
      return new Response(
        JSON.stringify({
          error: 'token_exchange_failed',
          description: 'Failed to exchange authorization code for tokens'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await storeConnectorCredentials(state.userId, state.connectorId, tokens);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully connected to ' + provider
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Location': state.redirectUrl
        }
      }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);

    return new Response(
      JSON.stringify({
        error: 'internal_error',
        description: (error as Error).message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function validateAndDecodeState(encodedState: string): OAuthState | null {
  try {
    const decoded = Buffer.from(encodedState, 'base64').toString('utf-8');
    const state: OAuthState = JSON.parse(decoded);

    const now = Date.now();
    const stateAge = now - state.timestamp;
    const maxAge = 10 * 60 * 1000;

    if (stateAge > maxAge) {
      console.error('State parameter expired');
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

async function exchangeCodeForTokens(
  _provider: string,
  _code: string,
  _state: OAuthState
): Promise<TokenResponse> {
  throw new Error('exchangeCodeForTokens must be implemented per provider');
}

async function storeConnectorCredentials(
  _userId: string,
  _connectorId: string,
  _tokens: TokenResponse
): Promise<void> {
  throw new Error('storeConnectorCredentials must be implemented');
}

export function generateOAuthState(
  userId: string,
  connectorId: string,
  redirectUrl: string
): string {
  const state: OAuthState = {
    userId,
    connectorId,
    redirectUrl,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15)
  };

  return Buffer.from(JSON.stringify(state)).toString('base64');
}
