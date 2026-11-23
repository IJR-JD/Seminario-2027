export function insertCommand(source,start,end,code){
  const lineStart=start===0?0:source.lastIndexOf('\n',start-1)+1;
  const nextBreak=source.indexOf('\n',end);
  const lineEnd=nextBreak<0?source.length:nextBreak;
  const firstLine=source.slice(lineStart).split('\n',1)[0];
  const indent=firstLine.match(/^ */)[0];
  const blank=!source.slice(lineStart,lineEnd).trim();
  const wholeLines=start===lineStart&&end>=lineEnd&&start!==end;
  const replace=blank||wholeLines;
  const insertionIndent=!replace&&firstLine.trimEnd().endsWith(':')?indent+'    ':indent;
  const body=code.split('\n').map(line=>insertionIndent+line).join('\n');
  const from=replace?lineStart:lineEnd;
  const prefix=replace?'':'\n';
  const value=source.slice(0,from)+prefix+body+source.slice(lineEnd);
  const token=body.match(/\b(?:0|1)\b/);
  const caret=from+prefix.length+(token?.index??body.length);
  return {value,start:caret,end:caret+(token?token[0].length:0)};
}
