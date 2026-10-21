/** Dieorun private bridge. Add settings in Project Settings > Script properties.
 * SPREADSHEET_ID, BRIDGE_SECRET (same secret as Worker), OWNER_EMAIL.
 * Never paste the secret in public JS or Google Sheet cells.
 */
function output_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function settings_(){var p=PropertiesService.getScriptProperties();return {sheet:p.getProperty('SPREADSHEET_ID'),secret:p.getProperty('BRIDGE_SECRET'),owner:p.getProperty('OWNER_EMAIL')||'r.s.vojoudi@gmail.com'};}
function table_(ss,name,headers){var s=ss.getSheetByName(name)||ss.insertSheet(name);if(s.getLastRow()===0){s.appendRow(headers);s.setFrozenRows(1);s.getRange(1,1,1,headers.length).setBackground('#263220').setFontColor('#ffffff').setFontWeight('bold');s.setRightToLeft(true);}return s;}
function setup(){var s=settings_();if(!s.sheet||!s.secret||s.secret.length<32)throw new Error('Set SPREADSHEET_ID and a 32+ character BRIDGE_SECRET in Script properties.');var ss=SpreadsheetApp.openById(s.sheet);table_(ss,'Members',['شناسه عضو','نام','ایمیل','شماره تماس','زمان عضویت','نسخه رضایت']);table_(ss,'Registrations',['شناسه سفارش','شناسه عضو','ایمیل','برنامه','شناسه برنامه','مبلغ تومان','وضعیت','شناسه پرداخت','زمان سفارش']);table_(ss,'Payments',['شناسه سفارش','شناسه عضو','ایمیل','برنامه','مبلغ تومان','وضعیت','شناسه پرداخت','زمان سفارش']);table_(ss,'Deliveries',['شناسه پیام','وضعیت ایمیل','آخرین تغییر']);}
function constantEqual_(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;var x=0;for(var i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}
function safe_(x){if(x===null||x===undefined)return '';if(typeof x==='number')return x;var s=String(x);return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
function rowFor_(sh,key){if(sh.getLastRow()<2)return null;var r=sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(String(key)).matchEntireCell(true).findNext();return r?r.getRow():null;}
function upsert_(sh,key,values){var row=rowFor_(sh,key)||sh.getLastRow()+1;sh.getRange(row,1,1,values.length).setValues([values.map(safe_)]);return row;}
function doGet(){return output_({ok:false,message:'POST only; signed requests required.'});}
function doPost(e){var lock=LockService.getScriptLock();try{
 var cfg=settings_();if(!cfg.sheet||!cfg.secret||cfg.secret.length<32)return output_({ok:false});
 var raw=e&&e.postData?e.postData.contents:'';if(raw.length>30000)return output_({ok:false});var envelope=JSON.parse(raw);if(typeof envelope.payload!=='string')return output_({ok:false});
 var bytes=Utilities.computeHmacSha256Signature(envelope.payload,cfg.secret,Utilities.Charset.UTF_8);var signature=bytes.map(function(b){return ('0'+(b<0?b+256:b).toString(16)).slice(-2);}).join('');if(!constantEqual_(signature,envelope.signature))return output_({ok:false});var d=JSON.parse(envelope.payload);if(!Number.isFinite(d.timestamp)||Math.abs(Date.now()/1000-d.timestamp)>300||!d.deliveryId)return output_({ok:false});
 lock.waitLock(20000);var ss=SpreadsheetApp.openById(cfg.sheet);var deliveries=ss.getSheetByName('Deliveries');if(!deliveries)throw new Error('Run setup first.');var delivered=rowFor_(deliveries,d.deliveryId);if(delivered&&deliveries.getRange(delivered,2).getValue()==='sent')return output_({ok:true,duplicate:true});
 var subject,body,to=cfg.owner;
 if(d.action==='otp'){
  if(!/^\S+@\S+\.\S+$/.test(d.email)||!/^\d{6}$/.test(d.code))return output_({ok:false});
  to=d.email;subject='کد ورود شما به دایوران';body='کد ورود شما: '+d.code+'\n\nاین کد تا ۱۰ دقیقه و فقط یک‌بار معتبر است.\nاگر این درخواست از شما نیست، پیام را نادیده بگیرید.\nکد را در اختیار دیگران نگذارید.\n\nDieorun';
 }else if(d.action==='account'){
  var u=d.user;upsert_(ss.getSheetByName('Members'),u.id,[u.id,u.name,u.email,u.phone,u.created_at,u.consent_version]);
  subject='دایوران | عضو جدید';body='یک حساب تأییدشده ساخته شد.\n\nنام: '+u.name+'\nایمیل: '+u.email+'\nشماره تماس: '+u.phone+'\nشناسه عضو: '+u.id+'\nزمان: '+u.created_at;
 }else if(d.action==='payment'||d.action==='registration'){
  var o=d.order,u=d.user;if(d.action==='payment'&&['paid','refund_required'].indexOf(o.status)<0)return output_({ok:false});if(d.action==='registration'&&o.status!=='free')return output_({ok:false});
  upsert_(ss.getSheetByName('Registrations'),o.id,[o.id,u.id,u.email,o.title,o.event_id,o.amount,o.status,o.reference||'',o.created_at]);
  if(d.action==='payment')upsert_(ss.getSheetByName('Payments'),o.id,[o.id,u.id,u.email,o.title,o.amount,o.status,o.reference||'',o.created_at]);
  subject='دایوران | '+(d.action==='payment'?'پرداخت تأییدشده':'ثبت‌نام رایگان')+(o.status==='refund_required'?' — نیازمند پیگیری ظرفیت و استرداد':'');body='نام: '+u.name+'\nایمیل: '+u.email+'\nبرنامه: '+o.title+'\nسفارش: '+o.id+'\nمبلغ: '+o.amount+' تومان\nوضعیت: '+o.status+'\nشناسه پرداخت: '+(o.reference||'بدون پرداخت');
 }else return output_({ok:false});
 // Rows are idempotent. MailApp has no idempotency key: rare retries after a send/ack crash can repeat an email.
 var dr=upsert_(deliveries,d.deliveryId,[d.deliveryId,'pending',new Date().toISOString()]);
 if(MailApp.getRemainingDailyQuota()<1)throw new Error('Mail quota exhausted; Worker will retry.');
 MailApp.sendEmail({to:to,subject:subject,body:body,name:'Dieorun Club'});
 deliveries.getRange(dr,2,1,2).setValues([['sent',new Date().toISOString()]]);SpreadsheetApp.flush();return output_({ok:true});
 }catch(err){return output_({ok:false,message:'Bridge failed. Check private Apps Script executions.'});}finally{if(lock.hasLock())lock.releaseLock();}}
