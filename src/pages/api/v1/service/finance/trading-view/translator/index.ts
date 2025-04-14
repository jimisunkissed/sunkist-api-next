import { errorMessage } from '@/lib/util/general/string-util';
import { apiEncodeRequest, onApiError, onApiSuccess } from '@/lib/util/server/api-util';
import { tradingViewTranslatorSchema } from '@/schema/lib/pages/api/v1/service/trading-view/trading-view-schema';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocket } from 'isomorphic-ws';

const fetchTradingView = async (from: string, date: string, type: string) => {
  return new Promise((resolve, reject) => {
    const headers = {
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      Host: 'data.tradingview.com',
      Origin: 'https://www.tradingview.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.266 Safari/537.36',
    };

    const ws = new WebSocket(apiEncodeRequest('wss://data.tradingview.com/socket.io/websocket', { from, date, type }), { headers });

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout waiting for websocket data'));
    }, 10000);

    const sendMessage = ({ func, args }: { func: string; args: any[] }) => {
      const message = JSON.stringify({
        m: func,
        p: args,
      });
      ws.send(`~m~${message.length}~m~${message}`);
    };

    const sessionId = 'cs_cHiCgq9eym6Z';
    const quoteId = 'qs_XekyJyt6CRzp';

    const receivedData: any[] | PromiseLike<any[]> = [];
    let messageCount = 0;
    const requiredMessages = 20;

    ws.onmessage = (event) => {
      const message: string = (event?.data ?? '') as string;
      const split = message.split('~m~')?.[2];
      if (!!message && !split.startsWith('~h~')) {
        const parsed = JSON.parse(split);
        const v = parsed?.p?.[1]?.v;
        messageCount++;

        // if (messageCount >= requiredMessages || timeout) {
        //   clearTimeout(timeout);
        //   ws.close();
        //   resolve(receivedData);
        // }
      }
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      // If we haven't resolved yet, reject with timeout
      if (receivedData.length === 0) {
        reject(new Error('Connection closed without receiving data'));
      }
    };

    ws.onopen = () => {
      sendMessage({ func: 'set_auth_token', args: ['unauthorized_user_token'] });
      sendMessage({ func: 'set_locale', args: ['en', 'US'] });
      sendMessage({ func: 'chart_create_session', args: [sessionId, ''] });
      sendMessage({ func: 'switch_timezone', args: [sessionId, 'Etc/UTC'] });
      sendMessage({ func: 'quote_create_session', args: [quoteId] });
      sendMessage({
        func: 'quote_set_fields',
        args: [
          quoteId,
          'ch',
          'chp',
          'current_session',
          'description',
          'local_description',
          'language',
          'exchange',
          'fractional',
          'is_tradable',
          'lp',
          'lp_time',
          'minmov',
          'minmove2',
          'original_name',
          'pricescale',
          'pro_name',
          'short_name',
          'type',
          'update_mode',
          'volume',
          'currency_code',
          'logoid',
          'currency-logoid',
          'base-currency-logoid',
        ],
      });
      sendMessage({ func: 'quote_add_symbols', args: [quoteId, 'IDX:BBCA'] });
      sendMessage({ func: 'quote_fast_symbols', args: [quoteId, 'IDX:BBCA'] });
      //   sendMessage({ func: 'quote_add_symbols', args: [quoteId] });
      //   sendMessage({ func: 'resolve_symbol', args: [sessionId, 'sds_sym_1', '={"adjustment":"splits","symbol":"IDX:BBCA"}'] });
      //   sendMessage({ func: 'create_series', args: [sessionId, 'sds_1', 's1', 'sds_sym_1', 'D', 300, ''] });
      //   sendMessage({ func: 'quote_remove_symbols', args: [quoteId, '={"adjustment":"splits","symbol":"IDX:BBCA"}'] });
      //   sendMessage({ func: 'quote_add_symbols', args: [quoteId, '={"adjustment":"splits","currency-id":"IDR","symbol":"IDX_DLY:BBCA"}'] });
      //   sendMessage({ func: 'request_more_tickmarks', args: [sessionId, 'sds_1', 10] });
    };
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return onApiError(req, res, 'Request method not allowed');
  const query = req.query;

  const validation = tradingViewTranslatorSchema.safeParse(query);
  if (!validation.success) return onApiError(req, res, validation.error.issues);

  try {
    const { from, date, type } = validation.data;

    const result = await fetchTradingView(from, date, type);

    return onApiSuccess(req, res, result);
  } catch (error) {
    return onApiError(req, res, errorMessage(error));
  }
}
