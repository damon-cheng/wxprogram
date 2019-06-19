//var questionnaireService = require('../services/questionnaireService.js');
var isEnglish = false;
var isKaoShi=true;
var prevChoiceD = 0;
var choiceStartWithNumber = false;
String.prototype.dbc2sbc = function () {
  return this.replace(/[\uff01-\uff5e]/g, function (a) { return String.fromCharCode(a.charCodeAt(0) - 65248); }).replace(/\u3000/g, " ");
}
function StringBuilder() {
  this._stringArray = new Array();
}
StringBuilder.prototype.append = function (str) {
  this._stringArray.push(str);
};

StringBuilder.prototype.toString = function (joinGap) {
  joinGap = joinGap || "";
  return this._stringArray.join(joinGap);
};
StringBuilder.prototype.clear = function () {
  this._stringArray.length = 0;
};

//**********************替换特殊字符**********************/
function replace_specialChar(str) {
  return str.replace(/(§)/g, "ξ").replace(/(¤)/g, "○").replace(/(〒)/g, "╤");
}


var curdiv = null;

function divQuestionMouseOut() {
}
function divQuestionClick() {
}

var MatrixType = "[矩阵题]";
var LikertMatrixType = "[矩阵量表题]";
var RevLikertMatrixType = "[矩阵反向量表题]";
var TableType = "[表格题]";
var SumType = "[比重题]";
var SortType = "[排序题]";
var LikertType = "[量表题]";
var ReverseLikertType = "[反向量表题]";
var LabelItem = "[标签]";
var DesignLabelItem = "【标签】";
var CutType = "[段落说明]";
var PageType = "[分页栏]";
var AllQType = "[题目]";
var CheckQType = "[多选题]";
var RadioQType = "[单选题]";
var GapFillType = "[问答题]";
var GapFillTest = "[测试填空题]"
var CeShiQType = "[测试题]";
var CeShiQCheckType = "[测试多选题]";
var CeShiJianDaType = "[测试简答题]";
var kaoshiBlankType = "[填空题]";
var label = "";
var qType = "";
var designversion = "7";
//全局版本号
var isCompact = false;
var GenerateType = 1;
//智能模式
var qIndex = 1;
//题号
var itemValue = 0;
var needExcute = false;
var prevDigit = -1;
var prevMatrixDigit = -1;
var numPerNow = 1;
var isNotClick = false;
var total_page = 0;

var firstPage = null;
//第一页的div，比较特殊，不能移动和删除
var questionHolder = null;
//除了第一页，所有的问题div
var cur = null;
//当前编辑的div,初始化时就会附值，防止出问题
var tempDataNode = null;
var curPos = 0;
var lineCharCount = 2;
var lineIndex = 0;
var lines = null;
var cutStartIndex = 0;
var cutEndIndex = 0;
var pageStartIndex = 0;
var pageEndIndex = 0;
var descStartIndex = -1;
var descEndIndex = -1;
var lastCaretPos = 0;
var isCompleteLoad = true;
var isMergeAnswer = false;
var total_question = 0;
var WjxActivity = new Object();
WjxActivity._use_self_topic = true;
var GapFillStr = "___";
var GapWidth = 21;
var GapFillReplace = "<input style='width:" + GapWidth + "px;' />";
var curChar = 0;
var titleProcessed = false;
//问题标题是否已经处理
var isDigitBig = false;
var firstQuestion = null;

function trim(str) {
  if (str && str.replace)
    return str.replace(/(^[\s\u3000]*)|([\s\u3000]*$)/g, "");
  else
    return str;

}
function toInt(_value) {
  return parseInt(trim(_value));

}
function isEmpty(_value) {
  return trim(_value) == "";

}
function isInt(_value)
//判断是否是整数
{
  var r = /^-?[0-9]+$/;
  return r.test(_value);

}
String.prototype.contains = function (it) {
  return this.indexOf(it) != -1;
};
String.prototype.endWith = function (str) {
  if (str == null || str == "" || this.length == 0 || str.length > this.length)
    return false;
  if (this.substring(this.length - str.length) == str)
    return true;
  else
    return false;
  return true;

}
String.prototype.startWith = function (str) {
  if (str == null || str == "" || this.length == 0 || str.length > this.length)
    return false;
  if (this.substr(0, str.length) == str)
    return true;
  else
    return false;
  return true;

}

RegExp.prototype.execAll = function (string) {
  var match = null;
  var matches = new Array();
  while (match = this.exec(string)) {
    var matchArray = [];
    for (i in match) {
      if (parseInt(i) == i) {
        matchArray.push(match[i]);
      }
    }
    matches.push(matchArray);
  }
  return matches;
}
function processKaoShiAnswer(lines, lineIndex, allDataNodes, ktype) {
  var hashObj = new Object();
  var pattern = /^(\d+)[\.、．:]/;
  for (var i = 0; i < allDataNodes.length; i++) {
    var datanode = allDataNodes[i];
    if (!datanode._isCeShi)
      continue;
    var title = datanode._title;
    var mdigit = title.match(pattern);
    if (mdigit && mdigit[1]) {
      hashObj[mdigit[1]] = datanode;
    }
  }
  if (ktype == 2) {
    for (var i = lineIndex; i < lines.length; i++) {
      var line = lines[i];
      var groups = /(\d+)[\s\.、：．:]*([A-Z]+|对|错|×|√)/g.execAll(line);

      for (var j = 0; j < groups.length; j++) {
        var r = groups[j];
        var digit = r[1];
        var answer = r[2];
        if (hashObj[digit]) {
          if (!answer.match(/^[A-Z]/)) {
            var dNode = hashObj[digit];
            qTitle = dNode._title + "(" + answer + ")";
            tempDataNode = AddQuestion(qTitle, digit);
            matchJiXi(lines[i + 1], lines, i, tempDataNode);
            tempDataNode._ispanduan = true;
            createQ(tempDataNode);
          }
          else {
            var dNode = hashObj[digit];
            processAnswer(dNode, false, answer);
            matchJiXi(lines[i + 1], lines, i, dNode);
            dNode._ispanduan = true;
            createQ(dNode);
          }

        }
      }

    }
  }
  else {
    for (var i = lineIndex; i < lines.length; i++) {
      var line = lines[i];
      var manswer = line.match(/^(\d+).*(答案[：:])\s*([A-Z]+)\s*/);
      if (manswer && manswer[3]) {
        var digit = manswer[1];
        if (hashObj[digit]) {
          var dNode = hashObj[digit];
          processAnswer(dNode, false, manswer[3]);

          matchJiXi(lines[i + 1], lines, i, dNode);
        }
      }
    }
    for (var i = 0; i < allDataNodes.length; i++) {
      createQ(allDataNodes[i]);
    }
  }

}
function matchJiXi(cline, lines, i, dNode) {
  var jiexireg = /^答?案?\s*解析[\:：\s]/;
  if (cline) {
    var lastData = trim(cline);
    if (lastData.match(jiexireg)) {
      var jiexidata = "";
      for (var j = i + 1; j < lines.length; j++) {
        var jline = lines[j];
        if (jline.match(/^(\d+).*(答案[：:])\s*([A-Z]+)\s*/))
          break;
        if (jline.match(/(\d+)[\s\.、：．:]*([A-Z]+)/g))
          break;
        if (jiexidata)
          jiexidata += "<br/>";
        jiexidata += trim(jline);
      }
      dNode._ceshiDesc = jiexidata.replace(jiexireg, "");
    }
  }
}


var Questionlist = new Array();


function generateQs(content,activityid) {
  Questionlist = new Array();
  if (questionHolder) {
    for (var i = 0; i < questionHolder.length; i++) {
      questionHolder[i].dataNode = null;
      questions.removeChild(questionHolder[i]);

    }
    total_page = 0;
    if (firstPage) questions.removeChild(firstPage);
    firstPage = null;

  }
  questionHolder = new Array();
  content = replace_specialChar(content);
  lines = content.split("<br/>");
  var totalLine = lines.length;
  var line;
  //去掉选项&标题，选项与选项之间的空行
  var hasRemoveLine = false; var prevwordChar = ""; var newContent = ""; var prevline = "";
  for (lineIndex = 0; lineIndex < totalLine; lineIndex++) {
    line = lines[lineIndex]; var nline = lines[lineIndex + 1];
    var wReg = /^\s*([A-Za-z])[^A-Za-z0-9]/; var needAdd = true;
    if (IsBlank(line) && IsBlank(nline)) {//有连续两个空行，则需要保留一个
      continue;
    }
    if (IsBlank(line) && nline) {//空行
      var wordChar = "";
      var mWord = nline.match(wReg);
      if (mWord) wordChar = mWord[1];
      if (mWord && prevline) {
        mWord = prevline.match(wReg);
        if (mWord) prevwordChar = mWord[1];
      }
      if ((wordChar == 'A' || wordChar == 'a') && prevwordChar == "") {
        needAdd = false; prevwordChar = wordChar; hasRemoveLine = true;
      }
      else if (prevwordChar && wordChar && wordChar.charCodeAt(0) == prevwordChar.charCodeAt(0) + 1) {
        needAdd = false; prevwordChar = wordChar; hasRemoveLine = true;
      }
    }
    if (!IsBlank(line))
      prevline = line;
    if (needAdd)
      newContent += line + "<br/>";

  }
  if (hasRemoveLine) {//删除了空行
    lines = content.split("<br/>");
    totalLine = lines.length;
  }

  var cut = "";
  var page = "";

  var first = true;
  var qTitle = "";

  var selectItem = false;
  //是否选择题选项
  var matrixItem = true;
  var isTable = false;
  var sumItem = false;
  qType = "question";
  //题型
  isDigitBig = false;
  var bigDigit = /^\s*([一二三四五六七八九十][\.。、\x20\t．:：]|[（(][一二三四五六七八九十][)）]|第[一二三四五六七八九十])/g;
  var bigDigigCount = 0; titleProcessed = false; firstQuestion = null; lineIndex = 0; curChar = 0;
  for (lineIndex = 0; lineIndex < totalLine; lineIndex++) {
    line = lines[lineIndex];
    if (bigDigit.exec(line))
      bigDigigCount++;
    if (bigDigigCount > 5) {
      isDigitBig = true;
      break;

    }

  }
  choiceStartWithNumber = false; prevChoiceD = 0; isCompact = false;
  if (GenerateType == 1) {
    var isCut = false;
    var isPage = false;
    for (lineIndex = 0; lineIndex < totalLine; lineIndex++) {
      line = lines[lineIndex];
      if (IsBlank(line))
        continue;

      if (StartWithDigit(line))
      //是否以数字开头
      {
        isCompact = true;
        break;

      }
      if (StartWithQType(line)) {
        isCompact = true;
        break;

      }
        if (!isCut || !isPage) {
          if (line.contains(CutType) || IsCut(line))
          //是分割符
          {
            isCut = true;
            isPage = false;
            cutStartIndex = lineIndex + 1;

          }
          else if (line.contains(PageType)) {
            isPage = true;
            isCut = false;
            pageStartIndex = lineIndex;

          }
          else {
            if (descStartIndex == -1) descStartIndex = lineIndex;

          }

        }
        if (isCut)
        //是分割符
        {
          cut += line + "<br/>";
          cutEndIndex = lineIndex + 1;

        }
        else if (isPage) {
          page += line + "<br/>";
          pageEndIndex = lineIndex + 1;

        }

      

    }

  }
  first = true;


  try {
    var answerbehind = false;
   
    if (answerbehind) {
      var acount = 0;
      for (var i = 0; i < lines.length; i++) {
        var manswer = lines[i].match(/^\d+.*(答案[：:])\s*([A-Z]+)\s*/);
        if (manswer && manswer[2]) {
          break;
        }
      }
    }
    var allDataNodes = new Array();
    while (true) {
      var hastempdatanode = false;
      if (lineIndex >= totalLine)
        break;
      line = trim(lines[lineIndex]);
      if (answerbehind) {
        //答案：
        var manswer = line.match(/^\d+.*(答案[：:])\s*([A-Z]+)\s*/);
        if (manswer && manswer[2]) {
          processKaoShiAnswer(lines, lineIndex, allDataNodes);
          break;
        }
        else if (line.contains("答案:") || line.contains("答案：")) {
          processKaoShiAnswer(lines, lineIndex, allDataNodes, 2);
          break;
        }
      }
      if (!titleProcessed)
      //标题未处理
      {
        if (!IsBlank(line))
        //处理标题
        {
          qTitle = line;
          qType = "question";
          //默认为问答题
          selectItem = false;
          sumItem = false;
          if (qTitle.contains(MatrixType) || qTitle.contains(LikertMatrixType) || qTitle.contains(RevLikertMatrixType) || qTitle.contains("[矩阵单选题]")) {
            matrixItem = true;
            qType = "matrix";

          }
          else if (qTitle.contains(TableType)) {
            matrixItem = true;
            isTable = true;
            qType = "matrix";

          }
          else if (qTitle.contains(SumType)) {
            qType = "sum";

          }
          else if (qTitle.contains(SortType)) {
            qType = "sort";

          }
          else if (qTitle.contains(LikertType) || qTitle.contains(ReverseLikertType)) {
            qType = "likert";
          }
          else if (qTitle.contains(CheckQType) || qTitle.contains(CeShiQCheckType)) {
            qType = "check";

          }
          else if (qTitle.contains(RadioQType) || qTitle.contains(CeShiQType))
            qType = "radio";
          else if (qTitle.contains(PageType)) {
            qType = "page";
            pageStartIndex = lineIndex + 1;

          }
          else if (qTitle.contains(GapFillType) || qTitle.contains(GapFillTest) || qTitle.contains(kaoshiBlankType)) {
            qType = "question";

          }
          else if (qTitle.contains(CutType) || (isCompact && IsCut(qTitle)))
          //信息栏
          {
            qType = "cut";
            cutStartIndex = lineIndex + 1;

          }
          else if (!StartWithDigit(qTitle)) {
            var lastHaveDigit = false;
            for (var tlll = lineIndex + 1; tlll < totalLine; tlll++) {
              var llLine = lines[tlll];
              if (StartWithDigit(llLine)) {
                lastHaveDigit = true;
                break;

              }

            }
            if (!lastHaveDigit) {
              qType = "cut";
              cutStartIndex = lineIndex + 1;

            }

          }
          titleProcessed = true;
        }
        lineIndex++;

      }

      if (titleProcessed)
      //处理了问题标题，需要处理题干
      {
        var nnn = lineIndex;
        var lineCount = 0;
        //题干行数
        var hasChoice = false;
        var firstLine = true;
        var containsAB = false;
        cut = "";
        var isQuestionExp = qTitle.contains(GapFillType) || qTitle.contains(GapFillTest);
        if (!isQuestionExp) {
          for (; nnn < totalLine; nnn++)
          //预读到下一题开始
          {
            var nl = lines[nnn];
            if (isCompact) {
              if (IsBlank(nl))
              //空行强制做一道新题
              {
                choiceStartWithNumber = false;
                break;

              }
              else if (StartWithQType(nl)) {
                prevDigit = GetStartDigit(nl);
                choiceStartWithNumber = false;
                break;

              }
              else if (StartWithDigit(nl))
              //兼容模式以数字或者题型开头分割
              {
                choiceStartWithNumber = false;
                break;

              }
              lineCount++;

            }
            else {
              if (IsBlank(nl))
                //严格模式以空行分割
                break;
              lineCount++;

            }

          }

        }
        for (; lineIndex < nnn; lineIndex++) {
          var nl = trim(lines[lineIndex]);
          if (qType == "cut" || qType == "page") {
            cut += lines[lineIndex];
            if (lineIndex < nnn - 1)
              cut += "<br/>";
            cutEndIndex = lineIndex + 1;
            pageEndIndex = lineIndex + 1;

          }
          else if (!IsBlank(nl))
          //题与题之间的空行不处理
          {
            hasChoice = true;
            if (qType == "matrix") {
              if (matrixItem)
              //矩阵题标题与列标题
              {
                var mode = "103";
                if (isTable) {
                  mode = "303";
                  itemValue = 0;

                }
                tempDataNode = AddMatrixTitle(qTitle, qIndex, mode);
                qIndex++;
                var items = nl.split(/(\x20|\t)+/ig);
                // Regex.Split(nl, "(\x20|\t)+"); //按空格和tab分隔
                for (var j = 0; j < items.length; j++) {
                  if (!isEmpty(trim(items[j])))
                    itemValue++;
                  AddSelectItem(tempDataNode, items[j]);

                }
                if (isTable) {
                  for (var vvjji = 1; vvjji < tempDataNode._select.length; vvjji++) {
                    tempDataNode._select[vvjji]._item_value = vvjji;
                  }
                }
                matrixItem = false;

              }
              else if (isTable) {
                var items = nl.split(/(\x20|\t)+/ig);
                // Regex.Split(nl, "(\x20|\t)+"); //按空格和tab分隔
                for (var j = 0; j < items.length; j++) {
                  AddColumn(tempDataNode, items[j]);

                }
                isTable = false;

              }
              else
              //矩阵题行标题
              {
                if (nl.startWith(LabelItem))
                  //是标签
                  label = nl.substr(4);
                else
                  AddMatrixLine(tempDataNode, nl);


              }

            }
            else if (qType == "sum") {
              if (!sumItem)
              //
              {

                tempDataNode = AddSumTitle(qTitle, qIndex);
                qIndex++;
                sumItem = true;

              }
              if (sumItem) {
                if (nl.startWith(LabelItem))
                  //是标签
                  label = nl.substr(4);
                else
                  AddMatrixLine(tempDataNode, nl);
              }
              //hasChoice=false;
            }
            else if (qTitle.contains(GapFillStr) && nl.match(/(答案|答[：:])\s*/) && qType != "check" && qType != "radio" && qType != "sort" && qType != "likert") {
              qType = "gapfill";
              tempDataNode = AddGapFill(qTitle, qIndex, nl);
              hasChoice = false;

            }
            else if (qTitle.contains(GapFillStr) && nl.match(/(答案解析|解析[：:])\s*/) && qType == "gapfill" && tempDataNode != null) {
              var jixci = nl.replace(/(答案解析|解析[：:])\s*/, "");
              tempDataNode._ceshiDesc = jixci;
              hasChoice = false;
            }
            else if (qTitle.contains(kaoshiBlankType) && qType != "check" && qType != "radio" && qType != "sort" && qType != "likert") {
              qType = "question";
              if (!hastempdatanode) {
                tempDataNode = AddQuestion(qTitle, qIndex);
                hastempdatanode = true;
              }
              var reganswer2 = /(答案[：:])\s*/;
              var matchAnswr = null;
              matchAnswr = nl.match(reganswer2);
              var reganswer3 = /(解析[：:])\s*/;
              var matchAnswr1 = null;
              matchAnswr1 = nl.match(reganswer3);
              if (matchAnswr) {
                processQuesAnswer(tempDataNode, false, nl)
              }
              else if (matchAnswr1) {

                processQuesAnswer(tempDataNode, true, nl)
              }
              hasChoice = false;
            }
            else
            //
            {
              if (qType != "sort" && qType != "likert" && qType != "check" && qType != "radio" && !qTitle.contains(kaoshiBlankType)) {

                qType = "radio";
                if (isCheck(qTitle))
                  qType = "check";

              }
              var hasTitleHasItem = false;
              if (!selectItem)
              //
              {
                hasTitleHasItem = false;// ProcessTitleItems(qTitle);//如果标题包含选项，直接添加新题
                //
                if (!hasTitleHasItem)//如果标题没有包含选项
                {
                  var containsAB = ContainsAB(nl, lines, lineIndex, nnn);
                  
                  tempDataNode = AddSelectTitle(qTitle, qIndex, qType);


                }
                itemValue = 0;
                qIndex++;
                selectItem = true;

              }
              if (selectItem && !hasTitleHasItem)//处理标签与更多选项
              {
                if (nl.startWith(LabelItem))//是标签
                  label = nl.substr(4);
                else {
                  if (qType == "radio" || qType == "likert")
                    itemValue++;
                  var items = null;
                  var split = false;
                  if (isCompact) {

                    if (firstLine) {
                      containsAB = ContainsAB(nl, lines, lineIndex, nnn);
                      firstLine = false;
                      curChar = 65;

                    }
                    if (containsAB)
                    //以字母分割
                    {
                      //items = nl.split(/([A-Z][^A-Z])/ig);
                      //  Regex.Split(nl, "([A-Z][^A-Z])", RegexOptions.IgnoreCase);
                      var tempNl = nl.toUpperCase();

                      //排除英文单词，3个字母连接在一起
                      var engArray = null;
                      if (isKaoShi)
                        engArray = tempNl.match(/[A-Z]{2,}/ig);
                     
                      if (engArray) {
                        for (var eee = 0; eee < engArray.length; eee++) {
                          var enlen = engArray[eee].length;
                          var repChar = "";
                          for (var eeee = 0; eeee < enlen; eeee++) {
                            repChar += "*";
                          }
                          tempNl = tempNl.replace(engArray[eee], repChar);
                        }
                      }
                      var newItem = ""; var fromIndex = 0;
                      for (; curChar < 90; curChar++) {
                        var a = String.fromCharCode(curChar);
                        var na = String.fromCharCode(curChar + 1);
                        var pa = String.fromCharCode(curChar - 1);
                        var charIndex = tempNl.indexOf(a);
                        var nextIndex = tempNl.indexOf(na);
                        var prevIndex = tempNl.indexOf(pa);
                        var otherIndex = tempNl.indexOf("其它");
                        if (otherIndex == -1) otherIndex = tempNl.indexOf("其他");
                        if (nextIndex == -1) {
                          na = String.fromCharCode(curChar + 2);
                          nextIndex = tempNl.indexOf(na);
                          if (nextIndex > -1) curChar++;

                        }
                        if (charIndex > -1 && nextIndex > -1) {
                          newItem = nl.substring(charIndex, nextIndex);
                          AddSelectItem(tempDataNode, newItem);

                        }
                        else if (charIndex > -1) {
                          newItem = nl.substring(charIndex);
                          AddSelectItem(tempDataNode, newItem);

                        }
                        else if (otherIndex > -1 && prevIndex == -1) {
                          newItem = nl.substring(otherIndex);
                          AddSelectItem(tempDataNode, newItem);
                          break;
                        }
                        else {
                          break;
                        }
                      }
                      if (isKaoShi && !newItem) {
                        var manswer = nl.match(/(答案[：:])\s*([A-Z]+)\s*/);
                        if (manswer && manswer[2])
                          AddSelectItem(tempDataNode, nl);
                        else {
                          var mjiexi = trim(nl).match(/^答?案?\s*解析[\:：\s]/);
                          if (mjiexi)
                            AddSelectItem(tempDataNode, nl);
                        }
                      }
                      split = true;
                    }
                  


                  }
                  if (!split)
                    AddSelectItem(tempDataNode, nl);

                }

              }

            }


          }

        }

        if (hasChoice)
        //非问答题(选择题，矩阵题等)结束
        {
          tempDataNode._endLine = lineIndex;
          if (qTitle.contains(LikertType) || qTitle.contains(ReverseLikertType) || qTitle.contains(LikertMatrixType) || qTitle.contains(RevLikertMatrixType)) {
            var isReverse = qTitle.contains(RevLikertMatrixType) || qTitle.contains(ReverseLikertType);
            var startVal = 1;
            if (isReverse)
              startVal = tempDataNode._select.length - 1;
            for (var vvjji = 1; vvjji < tempDataNode._select.length; vvjji++) {
              tempDataNode._select[vvjji]._item_value = startVal;
              if (isReverse) startVal--;
              else startVal++;
            }
          }
          else if (qTitle.contains(CeShiQType) || qTitle.contains(CeShiQCheckType) || isKaoShi) {
            tempDataNode._hasvalue = true;
            tempDataNode._isCeShi = true;
            tempDataNode._ceshiDesc = "";
            tempDataNode._ceshiValue = 5;
            var sReg = /\,\s*\[\s*(\d+)秒\]\s*$/;
            var matchVal = tempDataNode._title.match(sReg);
            if (matchVal && matchVal[1]) {
              tempDataNode._title = tempDataNode._title.replace(sReg, "");
            }
            var valReg = /[\(（\[]?\s*(\d+)分[\)）\]]?\s*$/;
            matchVal = tempDataNode._title.match(valReg);
            if (matchVal && matchVal[1]) {
              tempDataNode._ceshiValue = parseInt(matchVal[1]) || 5;
              tempDataNode._title = tempDataNode._title.replace(valReg, "");
            }
            var choiceCount = 0; var lastIndex = 0; var startIndex = 0;//判断标题是否有换行
            for (var vvjji = 1; vvjji < tempDataNode._select.length; vvjji++) {
              var itt = trim(tempDataNode._select[vvjji]._item_title);
              if (!itt.match(/^[A-Z]/)) {
                lastIndex = vvjji;
              }
              else {
                if (startIndex == 0)
                  startIndex = vvjji;
                choiceCount++;
              }
            }
            if (lastIndex > 0 && startIndex - lastIndex == 1 && choiceCount >= 2) {
              var vtitle = "";
              for (var vvjji = 1; vvjji < lastIndex; vvjji++) {
                vtitle += "<br/>" + tempDataNode._select[vvjji]._item_title;
              }
              tempDataNode._title = tempDataNode._title + vtitle;
              tempDataNode._select.splice(1, lastIndex);//
            }
            if (!answerbehind)
              processAnswer(tempDataNode, true);
          }
          if (tempDataNode._select && tempDataNode._numperrow >= tempDataNode._select.length)
            tempDataNode._numperrow = tempDataNode._select.length - 1;
          if (answerbehind)
            allDataNodes.push(tempDataNode);
          else
            createQ(tempDataNode, activityid);
          tempDataNode = null;
          //题目结束

        }
        else
        //只有一行,信息栏，分页或者问答题
        {
          if (qType == "cut" || qType == "page")
          //信息栏都放在最后处理
          {
            if (!isEmpty(cut))
              cut = qTitle + "<br/>" + cut;
            else
              cut = qTitle;
            if (qType == "cut")
              tempDataNode = AddCut(cut);
            else
              tempDataNode = AddPage(cut);
            createQ(tempDataNode, activityid);
            tempDataNode = null;
          }
          else if (ProcessTitleItems(qTitle))//标题里面包含选项
          {
            tempDataNode._endLine = lineIndex;
            createQ(tempDataNode, activityid);
            qIndex++;
            tempDataNode = null;//题目结束
          }
          else if (qType == "question" && qTitle.contains(kaoshiBlankType) && tempDataNode) {
            createQ(tempDataNode, activityid);
            qIndex++;
            tempDataNode = null;
          }
          else if (qType == "question")
          //问答题
          {
            if (lineCount == 1)
            //有一个选项的选择题
            {
              for (; lineIndex < nnn; lineIndex++) {
                var nl = lines[lineIndex];
                if (!IsBlank(nl))
                //题与题之间的空行不处理
                {
                  qTitle += nl;

                }

              }

            }
            tempDataNode = AddQuestion(qTitle, qIndex);
            if (answerbehind)
              allDataNodes.push(tempDataNode);
            else
              createQ(tempDataNode, activityid);
            tempDataNode = null;
            qIndex++;

          }
          else if (qType == "gapfill") {
            createQ(tempDataNode, activityid);
            qIndex++;
            tempDataNode = null;
          }

        }
        titleProcessed = false;
        //处理下一道题

      }

    }
  }
  catch (e)//发生异常，删除创建的xml文档
  {
  return false;
 }
 //questionnaireService.addQuestionlist(activityid, Questionlist);
 return Questionlist;
}
function processQuesAnswer(tempDataNode, needJieXi, canswer) {
  if (!needJieXi) {
    var reganswer2 = /(答案[：:])\s*/;
    var matchAnswr = null;
    matchAnswr = canswer.replace(reganswer2, "");
    tempDataNode._answer = matchAnswr;

  }
  else {
    var reganswer2 = /(解析[：:])\s*/;
    var matchAnswr = null;
    matchAnswr = canswer.replace(reganswer2, "");
    tempDataNode._ceshiDesc = matchAnswr;
  }
}
function processAnswer(tempDataNode, needJieXi, canswer) {

  var ma = false;
  var reganswer = /[\(（]\s*(答案[：:])?\s*([A-K、]+)\s*[\)）]/;
  var matchAnswr = tempDataNode._title.match(reganswer);
  if (!canswer && matchAnswr && matchAnswr[2])
    canswer = matchAnswr[2];
  var titleanswer = false;
  var sLen = tempDataNode._select.length;
  if (canswer) {
    var anser = canswer.replace(/、/g, "");
    for (var vvjji = 1; vvjji < sLen; vvjji++) {
      var itt = trim(tempDataNode._select[vvjji]._item_title);
      for (var bz = 0; bz < anser.length; bz++) {
        if (itt.startWith(anser[bz])) {
          tempDataNode._select[vvjji]._item_radio = true;
          ma = true; titleanswer = true;
          break;
        }
      }
    }
    if (!ma && anser.length == 1 && (anser[0] == "B" || anser[0] == "A") && tempDataNode._select.length == 3) {//判断题
      ma = true; var csel = 1; titleanswer = true;
      if (anser[0] == "B") csel = 2;
      tempDataNode._select[csel]._item_radio = true;
    }
    if (anser.length > 1)//多选题
      tempDataNode._type = "check";
  }
  else {
    var ccount = 0;
    for (var vvjji = 1; vvjji < tempDataNode._select.length; vvjji++) {
      var itt = trim(tempDataNode._select[vvjji]._item_title);
      itt = itt.replace("○", "");
      tempDataNode._select[vvjji]._item_title = itt;
      if (itt.contains("（正确答案）") || itt.contains("(正确答案)")) {
        tempDataNode._select[vvjji]._item_radio = true;
        ccount++;
        tempDataNode._select[vvjji]._item_title = itt.replace("（正确答案）", "").replace("(正确答案)", "");
        ma = true;
      }
    }
    if (ccount > 1 && tempDataNode._type == "radio")
      tempDataNode._type = "check";
  }
  if (!needJieXi) {
    if (!ma)
      tempDataNode._select[1]._item_radio = true;
    return;
  }
  if (sLen > 2) {
    var jiexireg = /^答?案?\s*解析[\:：\s]/;
    var lastData = trim(tempDataNode._select[sLen - 1]._item_title);
    var lastData2 = tempDataNode._select[sLen - 2]._item_title;
    var hasJiexi = false;
    if (itt.match(jiexireg)) {
      tempDataNode._ceshiDesc = lastData.replace(jiexireg, "");
      tempDataNode._select.pop();
      hasJiexi = true;
    }
    var reganswer2 = /(答案[：:])\s*([A-Z]+)\s*/;
    var matchAnswr = null;
    if (hasJiexi)
      matchAnswr = lastData2.match(reganswer2);
    else
      matchAnswr = lastData.match(reganswer2);
    if (matchAnswr && matchAnswr[2]) {
      tempDataNode._select.pop();
      if (!ma) {
        var anser = matchAnswr[2];
        for (var vvjji = 1; vvjji < tempDataNode._select.length; vvjji++) {
          var itt = trim(tempDataNode._select[vvjji]._item_title);
          for (var bz = 0; bz < anser.length; bz++) {
            if (itt.startWith(anser[bz])) {
              tempDataNode._select[vvjji]._item_radio = true;
              ma = true;
              break;
            }
          }
        }
        if (!ma && anser.length == 1 && (anser[0] == "B" || anser[0] == "A") && tempDataNode._select.length == 3) {//判断题
          ma = true; var csel = 1;
          if (anser[0] == "B") csel = 2;
          tempDataNode._select[csel]._item_radio = true;
        }
        if (anser.length > 1)//多选题
          tempDataNode._type = "check";
      }
    }
  }
  if (!ma)
    tempDataNode._select[1]._item_radio = true;
  else if (titleanswer)
    tempDataNode._title = tempDataNode._title.replace(reganswer, "（）");
  return ma;
}


function createQ(data_node, activityId) {
  var _type = data_node._type;
  if (_type != "radio") {
    return;
  }
  var option_radio = data_node._select;
  var optionlist = new Array();
  for (var i = 1; i < option_radio.length; i++) {
    var optionlist
    var arr =
      {
        "itemTitle": option_radio[i]._item_title,
        "itemRadio": option_radio[i]._item_radio ,
        "itemValue": "1",
        "itemJump": 0,
        "itemTextBox": null,
        "itemRequired": null,
        "itemImg": null,
        "itemLabel": null,
        "itemHuChi": null,
        "itemImgText": false,
        "itemDesc": null
      }
    optionlist.push(arr);
  }
  var question = {
    "activityId": activityId,
    "title": data_node._title,
    "type": "radio",
    "randomChoice": false,
    "topic": "",
    "numPerRow": 1,
    "hasValue": false,
    "requir": true,
    "minValue": null,
    "maxValue": null,
    "mode": null,
    "hasJump": false,
    "anytimeJumpto": "",
    "isTouPiao": null,
    "touPiaoWidth": null,
    "displayNum": null,
    "displayPercent": null,
    "displayThumb": null,
    "ins": "",
    "tag": null,
    "height": null,
    "verify": null,
    "ext": '.gif|.png|.jpg|.jpeg|.bmp',
    "maxSize": null,
    "width": null,
    "items": optionlist,
    "ceShiValue": 10,
    //"ceShiValue": this.data.fraction[this.data.fractionIndex],
  }
  Questionlist.push(question);
}



function SBCCaseToNumberic(str) {
  return str.dbc2sbc();
 

}
function DBC2SBC(obj) {
  var str = obj.value;
  var newstr = str.dbc2sbc();
  if (str != newstr)
    obj.value = newstr;
  
}


function GetStartDigit(line) {
  line = trim(line);
  var reg = /^\s*([a-zA-Z]|问题|第)?\s*\d+|\(\d\)+|[\uFF10-\uFF19]+|（[\uFF10-\uFF19]+）/g;
  var digit = -1;
  var match = reg.exec(line);
  if (match) {
    var val = match[0];
    if (val.length > 1 && (
      (val.charAt(0) >= 'a' && val.charAt(0) <= 'z') || (val.charAt(0) >= 'A' && val.charAt(0) <= 'Z')
    ))
      val = val.substr(1);
    val = val.replace(/第\s*/, "").replace(/问题\s*/, "");
    var digits = SBCCaseToNumberic(val);
    if (!isInt(digits)) {
      digit = -1;

    }
    else digit = toInt(digits);

  }
  if (isDigitBig) {
    reg = /^\s*([一二三四五六七八九十]{1,3})/g;
    match = reg.exec(line);
    if (match)
      return ChineseNumberToArabicNumber(match[0]);

  }
  return digit;

}

function StartWithDigit(line) {
  var digit = GetStartDigit(line);
  if (digit == -1)
    return IsSample(line);
  if (digit >= 1000)
    return false;

  var reg = /^\s*\d+\s*[-－—~～]{1,3}\s*\d+/g;
  if (reg.test(line) || /^\s*\d+[+次万%千小年以岁元人本个后级GXM分]/.test(line))
    return false;

  if (digit == prevDigit + 1 && !choiceStartWithNumber)
  //矩阵题小题处理
  {
    if (qType == "matrix")
    //是矩阵题的小题
    {
      if (digit == prevMatrixDigit + 1)
        return false;
      if (!StartWithQType(line))
        return false;
    }
    prevDigit = digit;
    choiceStartWithNumber = false;
    return true;

  }
  if (prevDigit == -1)
    prevDigit = digit;
  if (qType == "matrix")
    prevMatrixDigit = digit;
  reg = /\d[\.、]|\(?\d\)|（?\d）/g;
  var cols = line.match(reg);
  if (cols && cols.length >= 2) {
    if (cols.length == 2) {
      var regex = /(\d+\.\d+[\.、])/;
      var b = regex.test(line);
      if (b) {
        return true;
      }
    }
    var isCond = true;
    for (var i = 0; i < cols.length; i++) {
      var v = cols[i];
      var dd = toInt(v);
      if (prevChoiceD != 0) {
        var ccc = dd - prevChoiceD;
        if (ccc == 0 || dd / ccc - prevChoiceD / ccc != 1)
          isCond = false;

      }
      prevChoiceD = dd;

    }
    if (isCond)
      //连续的几个数字，当做选项处理
      return false;
    else
      prevChoiceD = 0;

  }
  if (qType == "matrix")
  //矩阵题单独处理
  {
    if (!StartWithQType(line))
      return false;
  }
  if (isKaoShi)
    return true;
  if (titleProcessed && qType != "cut" && digit == 1)
    choiceStartWithNumber = true;
  if (choiceStartWithNumber)
    return false;
  return true;

}
function ChineseNumberToArabicNumber(ChineseNumber) {
  var reg = /(^[一二三四五六七八九十]$)|(^十[一二三四五六七八九]$)|(^[二三四五六七八九]十?[一二三四五六七八九]{0,1}$)/;
  if (!reg.exec(ChineseNumber))
    return - 1;
  var ArabicNumber = -1;
  var ReturnStr = "";
  var ChineseNumberName = "一二三四五六七八九十";
  var IntArrayArabicNumberNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var length = ChineseNumber.length;
  switch (length) {
    case 1:
      ArabicNumber = IntArrayArabicNumberNames[ChineseNumberName.indexOf(ChineseNumber)];
      //                    return ArabicNumber;
      break;
    case 2:
      if (ChineseNumber[0] != '十') {
        ReturnStr = IntArrayArabicNumberNames[ChineseNumberName.indexOf(ChineseNumber[0])] + "";
        if (ChineseNumber[1] == "十")
          ReturnStr += "0";
        else
          ReturnStr += IntArrayArabicNumberNames[ChineseNumberName.indexOf(ChineseNumber[1])];
        ArabicNumber = toInt(ReturnStr);

      }
      else {
        ReturnStr = "1";
        ReturnStr += IntArrayArabicNumberNames[ChineseNumberName.indexOf(ChineseNumber[1])];
        ArabicNumber = toInt(ReturnStr);

      }
      break;
    case 3:
      ReturnStr = IntArrayArabicNumberNames[ChineseNumberName.indexOf(ChineseNumber[0])] + "";
      ReturnStr += IntArrayArabicNumberNames[ChineseNumberName.indexOf(ChineseNumber[2])] + "";
      ArabicNumber = toInt(ReturnStr);
      break;
    default:
      break;

  }
  return ArabicNumber;

}
function StartWithQType(line) {
  if (line.contains(MatrixType) || line.contains(LikertMatrixType) || line.contains(RevLikertMatrixType) || line.contains("[矩阵单选题]") || line.contains(SumType) || line.contains(RadioQType)
    || line.contains(CeShiQType) || line.contains(CeShiQCheckType) || line.contains(SortType) || line.contains(TableType) || line.contains(GapFillType) || line.contains(GapFillTest) || line.contains(kaoshiBlankType)
    || line.contains(LikertType) || line.contains(ReverseLikertType) || line.contains(CutType) || line.contains(PageType) || IsCut(line))
    return true;
  if (line.contains(AllQType)) {
    return true;

  }
  return false;

}
function IsCut(line) {
  line = trim(line);
  var reg = /^\s*(基本信息|个人信息)/g;
  if (reg.exec(line))
    return true;
  if (isDigitBig)
    return false;
  reg = /^\s*【?([一二三四五六七八九][\.。、\x20\t．:：]|[（(][一二三四五六七八九][)）]|第[一二三四五六七八九])/g;
  if (reg.exec(line)) {
    var count = line.match(/[一二三四五六七八九]/g).length;
    if (count > 2) return false;
    return true;

  }
  return false;

}
var SampleArray = ["公司", "工作", "薪水", "收入", "部门", "职业", "职别",
  "年龄", "姓名", "性别", "婚",
  "学校", "年级", "专业", "院系",
  "邮件", "Email", "手机", "电话", "地址", "城市"];
function IsSample(line) {
  line = trim(line);
  if (line.endWith(":") || line.endWith("：")) {
    for (var i = 0; i < SampleArray.length; i++) {
      if (line.contains(SampleArray[i]))
        return true;

    }

  }
  return false;

}
function IsBlank(line) {
  if (line == undefined) return false;
  var reg = /^(\-|=|_)+$/g;
  line = trim(line);
  if (reg.exec(line)) {
    return true;

  }
  if (!isEmpty(line) && line != "<br/>") {
    return false;

  }
  return true;

}
function IsNumber(c) {
  if (c == '0' || c == '1' || c == '2' || c == '3' || c == '4' || c == '5' || c == '6' || c == '7' || c == '8' || c == '9')
    return true;
  else
    return false;

}
function isCheck(qTitle) {
  if (qTitle.contains("单选"))
    return false;
  if (isKaoShi)
    return false;
  if ((qTitle.contains("多") || qTitle.contains("复数") || qTitle.contains("限") || qTitle.contains("最少") || qTitle.contains("至少")) && qTitle.contains("选")) {
    return true;

  }
  if (qTitle.contains("哪些") && !isKaoShi)
    return true;
  return false;

}

function AddTitle(title) {
  _title.innerHTML = trim(title);

}
function AddDesc(desc) {
  _desc.innerHTML = desc;
  var count = desc.split("\n").length;
  descEndIndex += count;
}
function AddCut(title) {
  var dataNode = new Object();
  dataNode._type = "cut";
  dataNode._title = title.replace(CutType, "");
  dataNode._tag = "";
  //无用

  dataNode._startLine = cutStartIndex;
  var line = title.split("\n").length;
  dataNode._endLine = cutStartIndex + line;

  //questionHolder.push(dataNode);
  return dataNode;

}
function AddQuestion(qTitle, qIndex) {

  if (qTitle.contains(GapFillStr) || qTitle.match(/\{.*?\}/)) {
    return AddGapFill(qTitle, qIndex);

  }

  var dataNode = new Object();
  dataNode._topic = qIndex + "";
  if (qTitle.contains(GapFillTest) || qTitle.contains(CeShiJianDaType) || isKaoShi) {
    dataNode._isCeShi = true;
    var patrn = /[\(（]?\s*([×错√对])\s*[\)）]?\s*$/;
    var matchVal = qTitle.match(patrn);
    if (matchVal && matchVal[1]) {
      dataNode._type = "radio";
      dataNode._title = qTitle.replace(patrn, "").replace(kaoshiBlankType, "");
      dataNode._keyword = "";
      dataNode._relation = "";
      dataNode._hasvalue = true;
      dataNode._ceshiDesc = "";
      dataNode._ceshiValue = 5;
      dataNode._hasjump = false;
      dataNode._anytimejumpto = "0";
      dataNode._requir = true;
      dataNode._ins = "";
      dataNode._randomChoice = false;
      dataNode._verify = "";
      dataNode._numperrow = 1;
      dataNode._ispanduan = true;
      dataNode._select = new Array();
      dataNode._select.push(new Object());
      var isRight = matchVal[1].contains("对") || matchVal[1].contains("√");
      var _select = new Object();
      _select._item_title = "对";
      _select._item_radio = isRight;
      _select._item_value = "";
      _select._item_jump = "0";
      _select._item_tb = false; _select._item_tbr = false; _select._item_img = ""; _select._item_imgtext = false; _select._item_desc = ""; _select._item_label = "";
      dataNode._select.push(_select);
      _select = new Object();
      _select._item_title = "错";
      _select._item_radio = !isRight;
      _select._item_value = "";
      _select._item_jump = "0";
      _select._item_tb = false; _select._item_tbr = false; _select._item_img = ""; _select._item_imgtext = false; _select._item_desc = ""; _select._item_label = "";
      dataNode._select.push(_select);
      return dataNode;
    }
    else if (qTitle.contains(CeShiJianDaType)) {
      dataNode._answer = "简答题无答案";
      dataNode._ceshiDesc = "";
    }
  }
  dataNode._type = "question";
  if (isKaoShi) {
    if (qTitle.contains(kaoshiBlankType)) {
      dataNode._answer = "请设置答案";
    }
    else {
      dataNode._answer = "简答题无答案";
    }

  }
  dataNode._title = ProcessTitle(qTitle.replace(patrn, "").replace(kaoshiBlankType, ""));
  dataNode._keyword = "";
  dataNode._relation = "";
  dataNode._verify = "";
  dataNode._tag = "";
  //无用
  dataNode._height = 1
  dataNode._maxword = "";
  dataNode._requir = true;
  dataNode._norepeat = false;
  //是否允许重复
  dataNode._default = ""
  dataNode._ins = "";
  dataNode._hasjump = false;
  dataNode._anytimejumpto = "0";
  dataNode._needOnly = false;
  dataNode._hasList = false;
  dataNode._listId = -1;
  dataNode._width = "";
  dataNode._underline = false;
  dataNode._minword = "";
  dataNode._startLine = lineIndex;
  dataNode._endLine = lineIndex;
  //questionHolder.push(dataNode);
  return dataNode;

}
function AddPage(qtitle) {
  total_page++;
  var dataNode = new Object();
  dataNode._type = "page";
  dataNode._topic = total_page + "";
  dataNode._title = qtitle.replace(PageType, "");
  dataNode._tag = "";
  dataNode._iszhenbie = false;
  dataNode._mintime = "";
  dataNode._maxtime = "";
  dataNode._startLine = pageStartIndex;
  dataNode._endLine = pageEndIndex;
  return dataNode;

}
function getGapFillCount(mainStr) {
  var count = 0;
  var offset = 0;
  var len = mainStr.length;
  var matchs = mainStr.match(/(\{.*?\})/g);
  if (matchs)
    return matchs.length;
  do {
    offset = mainStr.indexOf(GapFillStr, offset);
    if (offset != -1) {
      count++;
      offset += GapFillStr.length;
      for (var j = offset; j < len; j++) {
        if (mainStr.charAt(j) != '_') break;
        offset++;

      }

    }

  }
  while (offset != -1)
  return count;
}
function replaceGapFill(mainStr, dataNode) {
  var offset = 0;
  var start = 0;
  var resultBuilder = new StringBuilder();
  var gapIndex = 0;
  do {
    start = offset;
    offset = mainStr.indexOf(GapFillStr, offset);
    var tempFillStr = GapFillStr;
    if (offset != -1) {
      var moreGapcount = 0;
      resultBuilder.append(mainStr.substr(start, offset - start));
      offset += GapFillStr.length;
      for (var j = offset; j < mainStr.length; j++) {
        if (mainStr[j] != '_') break;
        moreGapcount++;
        tempFillStr += "_";
        offset++;

      }
      var tWidth = GapWidth + moreGapcount * (GapWidth / 3);
      var isDate = false;
      if (dataNode._rowVerify[gapIndex] && dataNode._rowVerify[gapIndex]._verify == "日期") {
        tWidth = 70;
        isDate = true;
      }
      var answerVal = "";
      if (dataNode._isCeShi) {
        var rowVerify = dataNode._rowVerify;
        if (rowVerify[gapIndex]) {
          var answer = (rowVerify[gapIndex]._answer || "请设置答案");
          answerVal = answer + ":" + (rowVerify[gapIndex]._ceshiValue || 1) + "分";
          var xWidth = answer.length * 12 + 24;
          if (tWidth < xWidth) tWidth = xWidth;
        }
      }
      var tempGapFillReplace = GapFillReplace.replace("width:" + GapWidth + "px", "width:" + tWidth + "px");
      if (answerVal)
        tempGapFillReplace = tempGapFillReplace.replace("/>", " value='" + answerVal + "'/>");
      if (dataNode._useTextBox)
        tempGapFillReplace = tempGapFillReplace.replace("/>", " class='inputtext'/>");
      else
        tempGapFillReplace = tempGapFillReplace.replace("/>", " class='underline'/>");
      resultBuilder.append(tempGapFillReplace);
      // if(isDate)
      // resultBuilder.append("<span class='design-icon design-date'></span>");
      //mainStr=mainStr.replace(tempFillStr,tempGapFillReplace);

      gapIndex++;

    }
    else {
      if (start < mainStr.length)
        resultBuilder.append(mainStr.substr(start));

    }

  }
  while (offset != -1)
  return resultBuilder.toString();

}
function AddGapFill(qTitle, qIndex, nl) {
  var count = getGapFillCount(qTitle);
  var dataNode = new Object();
  dataNode._type = "gapfill";
  dataNode._topic = qIndex + "";
  dataNode._verify = "";
  if (qTitle.contains(GapFillTest) || isKaoShi)
    dataNode._isCeShi = true;
  qTitle = ProcessTitle(qTitle.replace(kaoshiBlankType, ""));
  dataNode._title = qTitle;
  dataNode._keyword = "";
  dataNode._relation = "";
  dataNode._tag = "";
  dataNode._requir = true;
  dataNode._gapcount = count;
  dataNode._ins = "";
  dataNode._hasjump = false;
  dataNode._anytimejumpto = "0";
  dataNode._useTextBox = false;
  dataNode._rowVerify = new Array();
  if (isKaoShi) {
    if (nl) {
      var answers = nl.replace(/(答案|答[：:])\s*/, "");
      var answerlist = answers.split(/[；;]/);
      var count = getGapFillCount(qTitle);
      var blankcount = answerlist.length < count ? answerlist.length : count;
      if (blankcount > 0) {
        for (var i = 0; i < blankcount; i++) {
          dataNode._rowVerify[i] = new Object();
          dataNode._rowVerify[i]._answer = trim(answerlist[i]);
          dataNode._rowVerify[i]._ceshiValue = 1;
        }
      }
      qTitle = qTitle.replace(/(\{.*?\})/g, "______");
      dataNode._title = qTitle;

    }
    else {
      var matchs = qTitle.match(/\{(.*?)\}/g);
      if (matchs && matchs.length > 0) {
        for (var i = 0; i < matchs.length; i++) {
          dataNode._rowVerify[i] = new Object();
          dataNode._rowVerify[i]._answer = trim(matchs[i].replace("{", "").replace("}", ""));
          dataNode._rowVerify[i]._ceshiValue = 1;
        }
        qTitle = qTitle.replace(/(\{.*?\})/g, "______");
        dataNode._title = qTitle;
      }
    }
  }
  dataNode._startLine = lineIndex;
  dataNode._endLine = lineIndex;
  return dataNode;

}
function AddSelectTitle(qTitle, qIndex, qType) {
  var dataNode = new Object();
  dataNode._startLine = lineIndex;
  dataNode._tag = "";
  if (qType == "sort") {
    dataNode._type = "check";
    dataNode._tag = "1";
    qTitle = qTitle.replace(SortType, "");

  }
  else if (qType == "likert") {
    dataNode._type = "radio";
    dataNode._tag = "101";
    qTitle = qTitle.replace(LikertType, "").replace(ReverseLikertType, "");
  }
  else {
    dataNode._type = qType;
    qTitle = qTitle.replace(CeShiQType, "").replace(CeShiQCheckType, "");
  }
  dataNode._topic = qIndex + "";
  if (qType == "check") {
    var lreg = /限选(\d)项/;
    var match = qTitle.match(lreg);
    if (match && match[1] > 0) {
      dataNode._lowLimit = match[1];
      dataNode._upLimit = match[1]; qTitle = qTitle.replace(lreg, "");
    }
    lreg = /最多选(\d)项/;
    match = qTitle.match(lreg);
    if (match && match[1] > 0) {
      dataNode._upLimit = match[1]; dataNode._lowLimit = ""; qTitle = qTitle.replace(lreg, "");
    }
    lreg = /[最至]少选(\d)项/;
    match = qTitle.match(lreg);
    if (match && match[1] > 0) {
      dataNode._lowLimit = match[1]; dataNode._upLimit = "";
      qTitle = qTitle.replace(lreg, "");
    }
  }
  qTitle = ProcessTitle(qTitle);

  dataNode._title = qTitle;
  dataNode._keyword = "";
  dataNode._relation = "";
  if (qType == "likert")
    dataNode._hasvalue = true;
  else
    dataNode._hasvalue = false;
  dataNode._hasjump = false;
  dataNode._anytimejumpto = "0";
  dataNode._requir = false;
  dataNode._ins = "";
  dataNode._randomChoice = false;
  dataNode._verify = "";
  if (numPerNow >= 6)
    numPerNow = numPerNow / 2;
  if (qTitle == "您的性别：" && numPerNow == 1) {
    dataNode._verify = "性别";
    numPerNow = 6;

  }
  dataNode._numperrow = numPerNow;
  numPerNow = 1;
  dataNode._select = new Array();
  dataNode._select.push(new Object());
  //questionHolder.push(dataNode);
  return dataNode;

}
function AddSelectItem(dataNode, itemTitle) {
  itemTitle = trim(itemTitle).replace("□", "");
  // itemTitle.Trim().Trim(new char[] { '□' });
  if (!IsBlank(itemTitle)) {
    var hasOther = false;
    // if (itemTitle.contains("其他") || itemTitle.contains("其它"))
    // {
    //var len=itemTitle.length;var end=itemTitle.substring(len-1);
    if (itemTitle.endWith(GapFillStr) || itemTitle.endWith(GapFillStr + ")") || itemTitle.endWith(GapFillStr + "）")) {
      itemTitle = itemTitle.replace(/[_]/g, "");
      hasOther = true;

    }
    else if (itemTitle.contains("请注明") || itemTitle.contains("请说明")) {
      //itemTitle = itemTitle.replace(/[(（]?(请注明|请说明|请填写)[)）]?/g, "");
      hasOther = true;

    }
    //}
    var _select = new Object();
    _select._item_title = itemTitle;
    _select._item_radio = false;
    _select._item_value = "";
    _select._item_jump = "0";
    _select._item_tb = hasOther;
    _select._item_tbr = false;
    if (hasOther)
      _select._item_tbr = true;
    _select._item_img = "";
    _select._item_imgtext = false;
    _select._item_desc = "";
    _select._item_label = label || "";
    label = "";
    dataNode._select.push(_select);

  }

}
function AddColumn(dataNode, columnTitle) {
  if (isEmpty(trim(columnTitle)))
    return;
  if (!dataNode._columntitle) {
    dataNode._columntitle = columnTitle;

  } else
    dataNode._columntitle += "\n" + columnTitle;

}

function AddMatrixTitle(qTitle, qIndex, mode) {
  var dataNode = new Object();
  dataNode._startLine = lineIndex;
  dataNode._type = "matrix";
  dataNode._topic = qIndex + "";
  dataNode._keyword = "";
  dataNode._relation = "";
  dataNode._verify = "";
  //var number = 0;
  if (qTitle.contains(LikertMatrixType) || qTitle.contains(RevLikertMatrixType)) {
    mode = "101";
  }
  qTitle = ProcessTitle(qTitle);
  if (mode == "303")
    qTitle = qTitle.replace(TableType, "");
  else qTitle = qTitle.replace(MatrixType, "").replace(LikertMatrixType, "").replace(RevLikertMatrixType, "").replace("[矩阵单选题]", "");

  dataNode._tag = mode;
  dataNode._title = qTitle;
  if (mode == "303" || mode == "101")
    dataNode._hasvalue = true;
  else
    dataNode._hasvalue = false;
  dataNode._hasjump = false;
  dataNode._anytimejumpto = "0";
  dataNode._requir = false;
  dataNode._ins = "";
  dataNode._rowwidth = "";
  dataNode._rowwidth2 = "";
  dataNode._rowtitle = "";
  dataNode._rowtitle2 = "";
  dataNode._columntitle = "";
  dataNode._select = new Array();
  dataNode._select.push(new Object());
  return dataNode;

}

function AddMatrixLine(dataNode, itemTitle) {
  if (!IsBlank(itemTitle)) {
    if (!dataNode._rowtitle) dataNode._rowtitle = "";
    if (dataNode._rowtitle)
      dataNode._rowtitle += "\n";
    if (!isEmpty(label)) {
      dataNode._rowtitle += DesignLabelItem + label + "\n";
      label = "";

    }
    dataNode._rowtitle += itemTitle;

  }

}

function AddSumTitle(qTitle, qIndex) {
  var dataNode = new Object();
  dataNode._startLine = lineIndex;
  dataNode._verify = "";
  dataNode._type = "sum";
  dataNode._topic = qIndex + "";
  dataNode._keyword = "";
  dataNode._relation = "";
  //var number = 0;
  qTitle = ProcessTitle(qTitle);
  qTitle = qTitle.replace(SumType, "");
  dataNode._title = qTitle;
  dataNode._tag = "";
  dataNode._hasjump = false;
  dataNode._anytimejumpto = "0";
  dataNode._requir = false;
  dataNode._ins = "";
  dataNode._rowwidth = 100;
  dataNode._total = 100;
  return dataNode;

}
function ContainsAB(nl, lines, lineIndex, nnn) {
  if (isEnglish) return false;
  var tempNl = nl.toUpperCase();
  var aIndex = tempNl.indexOf("A");
  var containA = false;
  var containB = false;

  if (aIndex > -1) {
    containA = true;
    if (aIndex + 1 < tempNl.length && tempNl.charAt(aIndex + 1) >= 'A' && tempNl.charAt(aIndex + 1) <= 'Z') {
      containA = false;

    }

  }
  var containsAB = false;
  var containsA = containA && !tempNl.contains("AB");
  if (containsA)
  //此行包含A
  {
    aIndex = tempNl.indexOf("B");
    if (aIndex > -1)
    //判断本行是否包含B
    {
      containB = true;
      if (aIndex + 1 < tempNl.length && tempNl.charAt(aIndex + 1) >= 'A' && tempNl.charAt(aIndex + 1) <= 'Z') {
        containB = false;

      }

    }
    if (!containB && lineIndex + 1 < nnn)
    //判断下一行是否包含B
    {
      var nextLine = lines[lineIndex + 1].toUpperCase();
      aIndex = nextLine.indexOf("B");
      if (aIndex > -1) {
        containB = true;
        if (aIndex + 1 < nextLine.length && nextLine.charAt(aIndex + 1) >= 'A' && nextLine.charAt(aIndex + 1) <= 'Z') {
          containB = false;

        }

      }

    }
    if (containB) {
      containsAB = true;

    }

  }
  return containsAB;
}
function regsplit(str, regex) {
  var matches = str.split(regex),
    separators = str.match(regex),
    ret = [matches[0]];
  if (!separators) return ret;
  for (var i = 0; i < separators.length; ++i) {
    ret[2 * i + 1] = separators[i];
    ret[2 * i + 2] = matches[i + 1];
  }
  return ret;
}
function ProcessTitleItems(qTitle) {
  if (isEnglish) return false;
  //题目包括选项
  var titleContainsItems = false;
  var titleItems = null;
  var tempQTitle = qTitle.toUpperCase();
  var rqTitle = qTitle;
  var qType = "radio";
  if (isCheck(qTitle))
    qType = "check";
  var aIndex = tempQTitle.indexOf("A");
  var containA = false; var containB = false;

  if (aIndex > -1) {
    containA = true;
    if (aIndex + 1 < tempQTitle.length && tempQTitle.charAt(aIndex + 1) > 'A' && tempQTitle.charAt(aIndex + 1) < 'Z') {
      containA = false;
    }
  }
  aIndex = tempQTitle.indexOf("B");
  if (aIndex > -1) {
    containB = true;
    if (aIndex + 1 < tempQTitle.length && tempQTitle.charAt(aIndex + 1) > 'A' && tempQTitle.charAt(aIndex + 1) < 'Z') {
      containB = false;
    }
  }
  var containsAB = containA && containB && !tempQTitle.contains("AB");
  if (containsAB && !isKaoShi)//以字母分割
  {
    titleItems = regsplit(qTitle, /[A-Z][^A-Z]/ig);//qTitle.split(/([A-Z][^A-Z])/ig);// Regex.Split(qTitle, "([A-Z][^A-Z])", RegexOptions.IgnoreCase);
    rqTitle = titleItems[0];
    titleContainsItems = true;
    numPerNow = (titleItems.length - 1) / 2;
    tempDataNode = AddSelectTitle(rqTitle, qIndex, qType);
    // for(var j = 1; j < titleItems.length; j += 1)
    // alert(titleItems[j]);
    for (var j = 1; j < titleItems.length; j += 2) {
      var newItem = titleItems[j] + titleItems[j + 1];
      AddSelectItem(tempDataNode, newItem);
    }
  }
  else {
    var splitItem = /□|○|①|②|③|④|⑤|⑥|⑦|⑧/ig;
    titleItems = qTitle.split(splitItem);
    if (titleItems.length >= 3)//以复选框分割
    {
      numPerNow = titleItems.length - 1;
      var lastIn = rqTitle.search(splitItem);
      rqTitle = rqTitle.substr(0, lastIn);
      tempDataNode = AddSelectTitle(rqTitle, qIndex, qType);
      //if (!isEmpty(firstItem))
      //    AddSelectItem(tw, firstItem);
      for (var j = 1; j < titleItems.length; j += 1) {
        var newItem = titleItems[j];
        if (!isEmpty(newItem))
          AddSelectItem(tempDataNode, newItem);
      }
      titleContainsItems = true;

    }
  }
  return titleContainsItems;
}
function ProcessTitle(qTitle) {
  var startIndex = 0;
  //标题过滤
  qTitle = qTitle.replace("[单选题]", "").replace("[复选题]", "").replace("[多选题]", "").replace("[主观题]", "").replace("[问答题]", "").replace("[必答题]", "")
    .replace("(可多选)", "").replace("[排序题]", "").replace("(多选)", "").replace("[矩阵题]", "").replace("[矩阵单选题]", "").replace("[段落说明]", "").replace("[表格题]", "")
    .replace("[比重题]", "").replace("[分页栏]", "").replace(AllQType, "").replace("[测试填空题]", "").replace(CeShiJianDaType, "").replace("[简答题]", "");
  var pattern = /^(\d+)[\.、．:]/;  
  qTitle = qTitle.replace(pattern, "");
  if (!isCompact && IsNumber(qTitle.charAt(0)))
  //严格模式，过滤标题中的数字
  {
    startIndex++;
    for (var i = 1; i < qTitle.length; i++) {
      if (IsNumber(qTitle.charAt(i))) {
        startIndex++;

      }
      else {
        var c = qTitle.charAt(i);
        if (c == '.' || c == '。' || c == '、' || c == ' ' || c == '．') {
          startIndex++;

        }
        else
          break;

      }

    }
    return qTitle.substr(startIndex);

  }
  else {
    return qTitle;

  }

}

//***********************保存函数*************************/
var prevSaveData = "";
function saveMode(mode, obj) {
}
var hasJoinQuestion = false;
function save_paper(_state, mode, obj) {
}





function submitText(type) {
}

module.exports = {
  generateQs: generateQs
}