import { writeFileSync } from 'fs';
import { getCalendarInfo } from './src/services/calendar';
import { Solar } from 'lunar-typescript';

// 进度跟踪器
class ProgressTracker {
  private startTime: Date;
  private processed = 0;
  
  constructor(private total: number) {
    this.startTime = new Date();
  }

  update() {
    this.processed++;
    if (this.processed % 1000 === 0 || this.processed === this.total) {
      const elapsed = (new Date().getTime() - this.startTime.getTime()) / 1000;
      const percent = (this.processed / this.total * 100).toFixed(1);
      const speed = (this.processed / elapsed).toFixed(1);
      const remaining = ((this.total - this.processed) * elapsed / this.processed).toFixed(0);
      
      console.log(
        `进度: ${percent}% | ` +
        `已处理: ${this.processed}/${this.total} | ` +
        `速度: ${speed} 条/秒 | ` +
        `剩余时间: ${remaining}秒`
      );
    }
  }
}

// CSV表头
const header = '日期,农历年,农历月日,节气,节日,年柱,月柱,日柱,时柱\n';
writeFileSync('calendar_1900_2050.csv', header, 'utf-8');

// 日期范围
const startDate = new Date(1900, 0, 1);
const endDate = new Date(2050, 11, 31);
const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const progress = new ProgressTracker(totalDays);

console.log(`开始生成万年历数据 (共${totalDays}天)`);

// 批量处理设置
const BATCH_SIZE = 1000;
let batchData = '';

// 逐日生成数据
let currentDate = new Date(startDate);
while (currentDate <= endDate) {
  const solar = Solar.fromDate(currentDate);
  const calendarInfo = getCalendarInfo({ 
    date: solar.toYmd(),
    time: '12:00'
  });

  // 格式化CSV行
  const row = [
    solar.toYmd(),
    calendarInfo.lunar?.year || '',
    calendarInfo.lunar?.month + calendarInfo.lunar?.day || '',
    calendarInfo.solarTerm || '',
    calendarInfo.festivals?.join('|') || '',
    calendarInfo.bazi?.year || '',
    calendarInfo.bazi?.month || '',
    calendarInfo.bazi?.day || '',
    calendarInfo.bazi?.hour || ''
  ].join(',') + '\n';

  batchData += row;
  
  // 批量写入
  if (batchData.length >= BATCH_SIZE * 100 || currentDate >= endDate) {
    writeFileSync('calendar_1900_2050.csv', batchData, { flag: 'a' });
    batchData = '';
  }

  progress.update();
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log('日历CSV生成完成！');