import { lobeChat } from '@lobehub/chat-plugin-sdk/client';
import { memo, useEffect, useState } from 'react';

import Data from '@/components/Render';
import { CalendarResponseData } from '@/type';

const Render = memo(() => {
  const [data, setData] = useState<CalendarResponseData>();

  useEffect(() => {
    lobeChat.getPluginMessage().then((e: CalendarResponseData) => {
      setData(e);
    });
  }, []);

  return <Data {...data}></Data>;
});

export default Render;