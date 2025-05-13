import { Card, DatePicker, Divider, Tag } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CalendarResponseData, Festival } from '@/type';

const useStyles = createStyles(({ css, token }) => ({
  date: css`
    color: ${token.colorTextQuaternary};
  `,
  card: css`
    width: 100%;
  `,
  lunarInfo: css`
    font-size: 16px;
    margin-bottom: 12px;
  `,
  solarTerm: css`
    color: ${token.colorSuccess};
    font-weight: bold;
  `,
  festival: css`
    margin-right: 8px;
    margin-bottom: 8px;
  `,
  traditional: css`
    background-color: ${token.colorError};
    color: white;
  `,
  legal: css`
    background-color: ${token.colorPrimary};
    color: white;
  `,
}));

const Render = memo<Partial<CalendarResponseData>>(
  ({ date, lunar, solarTerm, festivals, weekDay }) => {
    const { styles } = useStyles();
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(
      date ? dayjs(date) : dayjs(),
    );

    const handleDateChange = (value: dayjs.Dayjs | null) => {
      setSelectedDate(value);
      // 这里可以添加日期变更后的处理逻辑
    };

    return (
      <Flexbox gap={24} padding={16}>
        <Flexbox distribution={'space-between'} horizontal>
          <h2>📅 万年历</h2>
          <DatePicker value={selectedDate} onChange={handleDateChange} />
        </Flexbox>
        
        <Card className={styles.card}>
          <Flexbox gap={16}>
            <Flexbox horizontal distribution="space-between">
              <h3>{date}</h3>
              <span className={styles.date}>{weekDay}</span>
            </Flexbox>
            
            <Divider orientation="left">农历</Divider>
            <div className={styles.lunarInfo}>
              {lunar?.year} {lunar?.month}{lunar?.day}
              <div>干支：{lunar?.ganzhi}</div>
            </div>
            
            {solarTerm && (
              <>
                <Divider orientation="left">节气</Divider>
                <div className={styles.solarTerm}>{solarTerm}</div>
              </>
            )}
            
            {festivals && festivals.length > 0 && (
              <>
                <Divider orientation="left">节日</Divider>
                <Flexbox horizontal wrap="wrap">
                  {festivals.map((festival: Festival, index) => (
                    <Tag
                      key={index}
                      className={`${styles.festival} ${
                        festival.type === 'traditional'
                          ? styles.traditional
                          : styles.legal
                      }`}
                    >
                      {festival.name}
                    </Tag>
                  ))}
                </Flexbox>
              </>
            )}
          </Flexbox>
        </Card>
      </Flexbox>
    );
  },
);

export default Render;