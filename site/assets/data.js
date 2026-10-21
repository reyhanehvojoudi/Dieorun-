// All fixtures are synthetic, including approximate district centers and coordinates.
export const sports={run:'دویدن',functional:'فانکشنال',crossfit:'کراسفیت',volleyball:'والیبال ساحلی',basketball:'بسکتبال',football:'فوتبال',yoga:'یوگا',cycling:'دوچرخه‌سواری'};
export const kinds={class:'کلاس',event:'رویداد',competition:'مسابقه',challenge:'چالش'};
export const colors={class:'#f9c7a0',event:'#f47700',competition:'#ffc75f',challenge:'#c8c4be'};
export const centers=[[35.805,51.445],[35.758,51.365],[35.765,51.437],[35.751,51.518],[35.747,51.302],[35.727,51.405],[35.723,51.453],[35.729,51.491],[35.685,51.337],[35.693,51.372],[35.678,51.396],[35.672,51.428],[35.699,51.488],[35.676,51.484],[35.648,51.467],[35.645,51.417],[35.657,51.365],[35.645,51.306],[35.620,51.376],[35.593,51.445],[35.704,51.241],[35.754,51.219]];
export function makeDemoEvents(now=new Date()){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const base=new Date(`${today}T00:00:00+03:30`).getTime();const keys=Object.keys(sports),types=Object.keys(kinds),hours=[7,9,12,16,18,20];
 return Array.from({length:264},(_,i)=>{let d=i%22,k=keys[(i*3+Math.floor(i/22))%8],type=types[(i+Math.floor(i/22))%4],offset=(i*7)%29,h=hours[i%6];
 return {id:`demo-${String(i+1).padStart(3,'0')}`,title:`${({run:'دورهمی دویدن',functional:'تمرین فانکشنال',crossfit:'تمرین کراسفیت',volleyball:'بازی والیبال ساحلی',basketball:'بسکتبال با هم',football:'فوتبال دوستانه',yoga:'یوگا و ریکاوری',cycling:'رکاب‌زنی گروهی'})[k]} · منطقه ${(d+1).toLocaleString('fa-IR')}`,sport:k,type,district:d+1,lat:+(centers[d][0]+Math.sin(i*2.37)*.012).toFixed(6),lng:+(centers[d][1]+Math.cos(i*1.71)*.018).toFixed(6),start:new Date(base+offset*86400000+h*3600000).toISOString(),duration:60+(i%3)*30,fee:i%7===0?0:[150000,240000,320000,450000,180000,280000][i%6],capacity:12+(i%5)*6,remaining:Math.min(12+(i%5)*6,3+(i%17)),level:['همهٔ سطح‌ها','مبتدی','متوسط'][i%3],venue:`محل تمرین نمونه در منطقهٔ ${d+1}`,address:'مختصات تقریبی و ساختگی است؛ برای مراجعهٔ حضوری استفاده نکنید.',coach:'مربی نمونهٔ دایوران',description:'یک تجربهٔ گروهی برای حرکت‌کردن، یادگرفتن و آشناشدن با آدم‌هایی که مثل تو از ورزش لذت می‌برند. این برنامه فقط برای نمایش امکانات سایت ساخته شده است.',equipment:'لباس ورزشی راحت، کفش مناسب و بطری آب',sample:true};});
}
export function filterEvents(events,f,now=new Date()){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const start=new Date(today+'T00:00:00+03:30').getTime();
 return events.filter(e=>{let t=new Date(e.start).getTime(),day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t)),hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tehran',hour:'2-digit',hourCycle:'h23'}).format(new Date(t)));
 return (!f.q||`${e.title} ${e.venue} ${sports[e.sport]}`.includes(f.q))&&(!f.type||e.type===f.type)&&(!f.sport||e.sport===f.sport)&&(!f.district||e.district===Number(f.district))&&(!f.fee|| (f.fee==='free'?e.fee===0:f.fee==='under'?e.fee<=250000:e.fee>250000))&&(!f.date||day===f.date)&&(!f.when||(f.when==='today'?t>=start&&t<start+86400000:f.when==='week'?t>=start&&t<start+7*86400000:hour>=17))&&(!f.level||e.level===f.level);
 }).sort((a,b)=>f.sort==='price'?a.fee-b.fee:new Date(a.start)-new Date(b.start));
}
