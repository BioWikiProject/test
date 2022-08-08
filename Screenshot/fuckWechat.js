(function (document) {
    var div = document.createElement('div');
    div.setAttribute('id', 'fuckWechat');
    document.querySelector('.mdui-appbar').style.filter = 'blur(2px)';
    document.querySelector('.mdui-container').style.filter = 'blur(2px)';
    div.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;box-sizing:border-box;padding:18px;font-size:16px;line-height:1.5em;background-color:rgba(255,255,255,.9);z-index:2147483647;display:flex;justify-content:center;align-items:center'
    div.innerHTML = ''
      + '<div>'
      +     '<h1>震惊！</h1>'
      +     '<p>关于这个事，我简单说两句，你明白就行，总而言之，这个事呢，现在就是这个情况，具体的呢，大家也都看得到，也得出来说那么几句，可能，你听的不是很明白，但是意思就是那么个意思，不知道的你也不用去猜，这种事情见得多了，我只想说懂得都懂，不懂的我也不多解释，毕竟自己知道就好，细细品吧。你们也别来问我怎么了，利益牵扯太大，说了对你我都没好处，当不知道就行了，其余的我只能说这里面水很深，牵扯到很多东西。详细情况你们自己是很难找的，网上大部分已经删除干净了，所以我只能说懂得都懂。懂的人已经基本都获利上岸什么的了，不懂的人永远不懂，关键懂的人都是自己悟的，你也不知道谁是懂的人也没法请教，大家都藏着掖着生怕别人知道自己懂事，懂了就能收割不懂的，你甚至都不知道自己不懂。只是在有些时候，某些人对某些事情不懂装懂，还以为别人不懂。其实自己才是不懂的，别人懂的够多了，不仅懂，还懂的超越了这个范围，但是某些不懂的人让这个懂的人完全教不懂，所以这种不懂的人也没必要访出来,不懂的人看见又来问七问八,最后跟他说了他也不一定能懂,就算懂了以后也对他不好,毕竟懂的太多了不是好事，所以大家最好是不懂就不要去了解,懂太多不好！！！ </p>'
      +     '<p><button style="width:100%;background-color:#175199;color:#fff;border:none;border-radius:4px;height:2em" onclick="document.body.removeChild(document.getElementById(\'fuckWechat\'));document.querySelector(\'.mdui-appbar\').style.filter=\'\';document.querySelector(\'.mdui-container\').style.filter=\'\';">继续</button></p>'
      +     '<p style="text-align:center;color:#bbb;font-size:14px">你没看错，这个遮罩层就是来 yygq 的<br>在微信以外的环境打开此页面，不会出现此遮罩层</p>'
      + '</div>';

    document.body.append(div);
})(document)