function loadScript(url) {
    var el = document.createElement('script');
    el.src = url;
    document.body.appendChild(el);
}

function xhrGet(url, callback) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', url);
    xhr.onload = function () { callback(xhr.responseText) };
    xhr.send();
}

location.hash = '';

mdui.confirm(''
        + '<div class="mdui-typo">'
        +     '<p>'
        +         '使用本工具<strong>不需要强制关注任何公众号或转发任何内容到朋友圈</strong>。如果你发现有公众号存在类似<strong>“关注○○，发送○○，转发○○到朋友圈领取○○”</strong>的行为，请对此类<strong>诱导行为</strong>进行<strong>投诉</strong>。'
        +         '<a href="https://mp.weixin.qq.com/cgi-bin/readtemplate?t=business/faq_operation_tmpl#3dot3_3" target="_blank">什么是诱导行为？</a>'
        +     '</p>'
        +     '<p>请勿以<strong>“关注○○，发送○○获取工具地址”</strong>或类似方式使用本工具为自己的公众号引流。如果想要推荐的话，请<strong>直接在正文里留下地址或二维码</strong>～</p>'
        +     '<p>本工具生成的截图，仅可用于<strong>个人应付各类强制要求转发朋友圈的情形</strong>，请勿<strong>批量生成截图</strong>或将截图用于<strong>造谣诽谤、微商宣传</strong>等非法或令人反感的用途，请勿用于商业用途，<strong>二次部署请勿删除原作者相关信息</strong>。</p>'
        +     '<p>当你生成截图时，你应该确定你可以接受向他人发送该截图将会带来的后果和影响，否则请不要使用本工具并离开当前页面。</p>'
        + '</div>',
    '在开始使用之前……',
    function () {},
    function () { location.href = 'about:blank' },
    {
        modal: true,
        closeOnEsc: false,
        history: false,
    }
);


if (navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1) loadScript('https://fastly.jsdelivr.net/gh/TransparentLC/WechatMomentScreenshot/fuckWechat.min.js');

if (!window.Promise) loadScript('https://fastly.jsdelivr.net/npm/promise-polyfill/dist/polyfill.min.js');

var avatarURL = [];
xhrGet('https://fastly.jsdelivr.net/gh/TransparentLC/WechatMomentScreenshot/avatarURL.json', function (result) { avatarURL = JSON.parse(result) });
var emoticon = [];
xhrGet('https://fastly.jsdelivr.net/gh/TransparentLC/WechatMomentScreenshot/emoticon.json', function (result) { emoticon = JSON.parse(result) });

// 读取配置
var configDefault = {
    name: 'A 修脚大师',
    text: '很实用的教程[微笑]\n呕～(　^ω^)😍😍😍😍',
    location: '',
    app: '',
    height: 1920,
    uiWhite: false,
    firstAvatar: false,
    appIcon: false,
    statusIcon: true,
};
var config;
var avatarFile;
try {
    config = JSON.parse(localStorage.getItem('config')) || {};
} catch (error) {
    config = {};
}
for (var k in configDefault) {
    if (config[k] === undefined) config[k] = configDefault[k];
}
document.getElementById('configName').value = config.name;
document.getElementById('configText').value = config.text;
document.getElementById('configLocation').value = config.location;
document.getElementById('configApp').value = config.app;
document.getElementById('configHeight').value = config.height;
document.getElementById('configUIWhite').checked = config.uiWhite;
document.getElementById('configFirstAvatar').checked = config.firstAvatar;
document.getElementById('configTopBarAppIcons').checked = config.appIcon;
document.getElementById('configTopBarStatusIcons').checked = config.statusIcon;
document.getElementById('avatar').style.backgroundImage = 'url(' + (localStorage.getItem('avatar') || 'https://ae01.alicdn.com/kf/HTB1yE4fMmzqK1RjSZFp761kSXXal.png') + ')';

//输入微信文章的链接，通过后端自动获取文章标题和文章封面
function getArticleInfo() {
    var requestDialog = new mdui.Dialog('#request');
    mdui.prompt('公众号文章链接', function (value) {
        var xhr = new XMLHttpRequest;
        xhr.open('GET', 'https://i.akarin.dev/wmsproxy/?url=' + encodeURIComponent(value)); //获取标题和封面的服务器
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var result = JSON.parse(xhr.responseText);
                document.getElementById('requestAction').innerText = 'OK';

                if (requestDialog.getState() == 'opening' || requestDialog.getState() == 'opened') {
                    if (typeof(result) != 'undefined' && result.success) {
                        document.getElementById('configArticleTitle').value = result.title;
                        document.getElementById('articleTitle').innerText = result.title;
                        document.getElementById('articleIcon').style.backgroundImage = 'url(\"' + result.cover + '\")';
                        document.getElementById('requestResult').innerText = '获取成功！(ゝ∀･)';
                        document.getElementById('requestResultContent').innerHTML = '标题：' + result.title + '<br>封面：<a target="_blank" href="' + result.cover + '">点此查看</a>';
                    } else {
                        document.getElementById('requestResult').innerText = '获取失败！( ´_っ`)';
                        document.getElementById('requestResultContent').innerHTML = '输入的链接是否为微信公众号文章？<br>（链接通常以 <code>https://mp.weixin.qq.com/</code> 作为开头）';
                    }
                }
            } else {
                document.getElementById('requestResult').innerText = '获取失败！( ´_っ`)';
                document.getElementById('requestResultContent').innerHTML = '无法连接到服务器。';
            }
            requestDialog.handleUpdate();
        }
        xhr.send();
        document.getElementById('requestResult').innerText = '';
        document.getElementById('requestAction').innerText = 'CANCEL';
        document.getElementById('requestResultContent').innerHTML = '<div class="mdui-valign"><div class="mdui-spinner"></div><span class="mdui-m-l-2">获取中…… (oﾟωﾟo)</span></div>';
        mdui.updateSpinners();
        requestDialog.open();
    }, function () {});
}

//删除所有发表的九宫格图片
function clearMultiImage() {
    for (var i = 1; i <= 9; i++) {
        document.getElementById('image' + i).style.backgroundImage = '';
    }
}

//将时间转换为微信中显示的格式
function getTimeString(currentDate, specificDate) {
    var cd = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60 * 1000 - (currentDate.getTime() - currentDate.getTimezoneOffset() * 60 * 1000) % (60 * 60 * 24 * 1000));
    var sd = new Date(specificDate.getTime() - specificDate.getTimezoneOffset() * 60 * 1000 - (specificDate.getTime() - specificDate.getTimezoneOffset() * 60 * 1000) % (60 * 60 * 24 * 1000));
    if (cd.getTime() == sd.getTime()) {
        return ((specificDate.getHours() < 10) ? ('0' + specificDate.getHours()) : specificDate.getHours()) + ':' + ((specificDate.getMinutes() < 10) ? ('0' + specificDate.getMinutes()) : specificDate.getMinutes());
    } else if (cd.getTime() - sd.getTime() == 60 * 60 * 24 * 1000) {
        return '昨天 ' + ((specificDate.getHours() < 10) ? ('0' + specificDate.getHours()) : specificDate.getHours()) + ':' + ((specificDate.getMinutes() < 10) ? ('0' + specificDate.getMinutes()) : specificDate.getMinutes());
    } else {
        return specificDate.getFullYear() + '年' + (specificDate.getMonth() + 1) + '月' + specificDate.getDate() + '日 ' + ((specificDate.getHours() < 10) ? ('0' + specificDate.getHours()) : specificDate.getHours()) + ':' + ((specificDate.getMinutes() < 10) ? ('0' + specificDate.getMinutes()) : specificDate.getMinutes());
    }
}

//复制短链接
function copyGitLink() {
    document.getElementById('gitLink').style.display = 'block';
    var range = document.createRange();
    range.selectNodeContents(document.getElementById('gitLink'));
    var selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('Copy');
    selection.removeAllRanges();
    mdui.snackbar({
        message: '已复制到剪贴板～( っ*\'ω\'*c)'
    });
    document.getElementById('gitLink').style.display = 'none';
}

var commentList = [];

//添加评论
function addComment(avatar, name, content, date, reply) {
    commentList.push({
        avatar,
        name,
        content,
        date,
        reply,
    });

    var tr = document.createElement('tr');
    tr.innerHTML = '<th>' + commentList.length + '</th><th>' + name + (reply ? ('（回复' + reply + '）') : '') + '</th><th>' + content + '</th><th>' + date.toLocaleString() + '</th>';
    document.getElementById('configCommentList').append(tr);
}

//删除（最后一条）评论
function removeComment() {
    if (commentList.length) {
        commentList.pop();
        document.getElementById('configCommentList').removeChild(document.getElementById('configCommentList').lastChild);
    }
}

//替换表情文字和换行符为对应的HTML标签
function emoticonReplace(text) {
    text = text.replace(/\r?\n/g, '<br>');
    for (var i = 0; i < emoticon.length; i++) {
        text = text.replace(new RegExp(emoticon[i].name, 'g'), '<img class="emoticon" src="' + emoticon[i].URL + '">');
    }
    return text;
}

//生成随机姓名，数据来自于faker.js
//https://github.com/Marak/faker.js/blob/master/lib/locales/zh_CN/name/index.js
function randomName() {
    var firstName = ["王","李","张","刘","陈","杨","黄","吴","赵","周","徐","孙","马","朱","胡","林","郭","何","高","罗","郑","梁","谢","宋","唐","许","邓","冯","韩","曹","曾","彭","萧","蔡","潘","田","董","袁","于","余","叶","蒋","杜","苏","魏","程","吕","丁","沈","任","姚","卢","傅","钟","姜","崔","谭","廖","范","汪","陆","金","石","戴","贾","韦","夏","邱","方","侯","邹","熊","孟","秦","白","江","阎","薛","尹","段","雷","黎","史","龙","陶","贺","顾","毛","郝","龚","邵","万","钱","严","赖","覃","洪","武","莫","孔"];
    var lastName = ["八蛋","博文","梓晨","胤祥","瑞霖","明哲","天翊","凯瑞","健雄","耀杰","潇然","子涵","越彬","钰轩","智辉","致远","俊驰","雨泽","烨磊","晟睿","文昊","修洁","黎昕","远航","旭尧","鸿涛","伟祺","荣轩","越泽","浩宇","瑾瑜","皓轩","擎苍","擎宇","志泽","子轩","睿渊","弘文","哲瀚","雨泽","楷瑞","建辉","晋鹏","天磊","绍辉","泽洋","鑫磊","鹏煊","昊强","伟宸","博超","君浩","子骞","鹏涛","炎彬","鹤轩","越彬","风华","靖琪","明辉","伟诚","明轩","健柏","修杰","志泽","弘文","峻熙","嘉懿","煜城","懿轩","烨伟","苑博","伟泽","熠彤","鸿煊","博涛","烨霖","烨华","煜祺","智宸","正豪","昊然","明杰","立诚","立轩","立辉","峻熙","弘文","熠彤","鸿煊","烨霖","哲瀚","鑫鹏","昊天","思聪","展鹏","笑愚","志强","炫明","雪松","思源","智渊","思淼","晓啸","天宇","浩然","文轩","鹭洋","振家","乐驹","晓博","文博","昊焱","立果","金鑫","锦程","嘉熙","鹏飞","子默","思远","浩轩","语堂","聪健","明","文","果","思","鹏","驰","涛","琪","浩","航","彬"];
    return firstName[Math.floor(Math.random() * firstName.length)] + lastName[Math.floor(Math.random() * lastName.length)];
}

//在已选择的单张图片上添加播放视频的图标
function addPlayIcon() {
    Promise.all([
        new Promise(resolve => {
            var img = new Image;
            img.crossOrigin = 'anonymous';
            img.onload = function () { resolve(img); };
            img.src = document.getElementById('image').src;
        }),
        new Promise(resolve => {
            var img = new Image;
            img.onload = function () { resolve(img); };
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAZlBMVEUAAAAAAADV1dX19fX4+Pj8/PzNzc2goKBAQEDy8vLLy8u/v7/d3d1qamrr6+vw8PDk5OTd3d3n5+eKiorW1tbw8PDt7e3h4eHm5uba2trq6ur09PTn5+exsbHl5eXi4uLj4+P///+1KpiJAAAAIXRSTlMzAJnY5fIUZkDJjYBKTZvMsqWNWSa6rFuOS7/Ie3NrNkgRMr3KAAAD0UlEQVR42uSX2ZaqMBBFq0EyGcBGRtuh+f+fvHRKBG3xUlTwpc+DspaS7JzUkMDHEonvY1ZqnbZOqdZldvwWi4YiA4iq1lH7VJGuKxIFHcAmYfsfhYnF//oHqMqonaWorPwD5MmmJWiT5V4BbPFodBoEUsoYOsXdQxCkj5tTWG8Ajb5b3MFIeCppDnc26cYLgB1Pn5o9vNTehGMEywbIv0a+GwUzpMYMXzkLQGRDaO9imK14NyRMJpYD2M1t440CklQwvGuXAiS3IbawQNsbQiKWAFzC3vxAwSKpIOqj50IHOPcv7xQsltr1izhTAZLefQksyU2/DSQA0Ve+TwVMqc++Mor5ACK8GncCDzpF10AQ8wCG+cMYvCgOe4J5APn1/zvwpt00AUyu34BHmUkCmJp/C161nSIAxvwMgmmAgjY/naB4DZBQ56cTJK8AzvT56QTnaYBLRI9/ei5ElykAERLyn1EPwimABH+GFYVLTJ4DWDQohhUV4ybbZwACG+cJVtUJm7x4ApBh/4WVhd05+w2QI5qClaXQ6PwXAJ7/JawuifeFRwBLy0B+LtoHAO0yQMEbpFwm6HuAxlEF8BYFbrLmDkBTI5Afh3oMYOk9iN+V7AigcAbA2+QsKAaAnBEBjCjIbwAZLQWk8pMI2Q1gQynC2wgvTPxasOkBKmfIzC6493JljN0o1RWgpBwDguHWyD4YlFcAtyGGAsA3wbiwQwAsAooCwDdBYSlwAAnuABEATWDuQeIA3KOhAfBNMG7ZPwDCjbSnAfBNwGwSHUCFZZgKMJjAKcdVB1D/PByWA7ThHpbo0HaqPwA7sWEALOwiBnsyYBWQVAC+CRIrAWAMAhmAbwJGITRuBWwANIEehQ0cf75SOgDfhLTtdIQa36UC8E3AkWoo+QCDAjJACRqTgA2ASmNiGmjPAG1kqAApA4BngsTwx+OYR4A22lKOZYCf/gAIhq4HEPx5gH/d20EKwjAURVGsGThScdj9L1Twg5MqNDTJ+WlXUGia/Lx3b80n8IuQ/4Z8I+JbMT+M+HHMB5LPSFbcSOaHUj6W+4sJv5rxyym/nvOAIiKah4locoRUPKbzQSWPaiOsfrqw+nJHcX2ewoJXNr60GlzbRXOZq7jk1e3I8nqNFZCtvvcAA0c4PMTCMZ4RINPtL8gUzyiUKy3M5nE+DzR6pNNDrRzr7QQ2LzvB5niDjmj3HHC7x/u94OAVj2aSy/qVXObTfJqKTg1Ur+WI6jWv7OZ1v43weK0VHs+gfP6UXstWei3dpNdYC69a7fds4nMG9TuD/N5B/38D8Sl28Qj+OSkAAAAASUVORK5CYII';
        }),
    ])
        .then(function (/** @type {HTMLImageElement[]} */ imgs) {
            var sourceImg = imgs[0];
            var playIcon = imgs[1];
            var canvas = document.createElement('canvas');
            canvas.width = sourceImg.width
            canvas.height = sourceImg.height
            var ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImg, 0, 0)
            ctx.drawImage(playIcon, sourceImg.width / 2 - canvas.width / 4 / 2, sourceImg.height / 2 - canvas.width / 4 / 2, canvas.width / 4, canvas.width / 4);
            canvas.toBlob(function (blob) {
                URL.revokeObjectURL(document.getElementById('image').src);
                document.getElementById('image').src = URL.createObjectURL(blob);
                console.log(URL.createObjectURL(blob));
                mdui.snackbar('已添加视频播放图标');
            });
        })
}

//设置界面显示
document.getElementById('configTypeText').onclick = function () {
    document.getElementById('configWebsite').style.display = 'none';
    document.getElementById('configSingleImage').style.display = 'none';
    document.getElementById('configMultiImage').style.display = 'none';
    document.getElementById('article').style.display = 'none';
    document.getElementById('singleImage').style.display = 'none';
    document.getElementById('multiImage').style.display = 'none';
}
document.getElementById('configTypeWebsite').onclick = function () {
    document.getElementById('configWebsite').style.display = 'block';
    document.getElementById('configSingleImage').style.display = 'none';
    document.getElementById('configMultiImage').style.display = 'none';
    document.getElementById('article').style.display = 'flex';
    document.getElementById('singleImage').style.display = 'none';
    document.getElementById('multiImage').style.display = 'none';
}
document.getElementById('configTypeSingleImage').onclick = function () {
    document.getElementById('configWebsite').style.display = 'none';
    document.getElementById('configSingleImage').style.display = 'block';
    document.getElementById('configMultiImage').style.display = 'none';
    document.getElementById('article').style.display = 'none';
    document.getElementById('singleImage').style.display = 'block';
    document.getElementById('multiImage').style.display = 'none';
}
document.getElementById('configTypeMultiImage').onclick = function () {
    document.getElementById('configWebsite').style.display = 'none';
    document.getElementById('configSingleImage').style.display = 'none';
    document.getElementById('configMultiImage').style.display = 'block';
    document.getElementById('article').style.display = 'none';
    document.getElementById('singleImage').style.display = 'none';
    document.getElementById('multiImage').style.display = 'block';
}

//设初始值
var date = new Date();
document.getElementById('configScreenshotDate').valueAsDate = date;
document.getElementById('configScreenshotTimeHour').value = date.getHours();
document.getElementById('configScreenshotTimeMinute').value = date.getMinutes();
document.getElementById('configPostDate').valueAsDate = date;
document.getElementById('configPostTimeHour').value = date.getHours();
document.getElementById('configPostTimeMinute').value = date.getMinutes();
document.getElementById('configCommentDate').valueAsDate = date;
document.getElementById('configCommentTimeHour').value = date.getHours();
document.getElementById('configCommentTimeMinute').value = date.getMinutes();
document.getElementById('configLike').value = Math.floor(20 * Math.random());

//检验数值是否合法
document.getElementById('configPostTimeHour').addEventListener('input', function () {
    if (document.getElementById('configPostTimeHour').value > 23) {
        document.getElementById('configPostTimeHour').value = 23;
    } else if (document.getElementById('configPostTimeHour').value < 0) {
        document.getElementById('configPostTimeHour').value = 0;
    }
})
document.getElementById('configPostTimeMinute').addEventListener('input', function () {
    if (document.getElementById('configPostTimeMinute').value > 59) {
        document.getElementById('configPostTimeMinute').value = 59;
    } else if (document.getElementById('configPostTimeMinute').value < 0) {
        document.getElementById('configPostTimeMinute').value = 0;
    }
})
document.getElementById('configScreenshotTimeHour').addEventListener('input', function () {
    if (document.getElementById('configScreenshotTimeHour').value > 23) {
        document.getElementById('configScreenshotTimeHour').value = 23;
    } else if (document.getElementById('configScreenshotTimeHour').value < 0) {
        document.getElementById('configScreenshotTimeHour').value = 0;
    }
})
document.getElementById('configScreenshotTimeMinute').addEventListener('input', function () {
    if (document.getElementById('configScreenshotTimeMinute').value > 59) {
        document.getElementById('configScreenshotTimeMinute').value = 59;
    } else if (document.getElementById('configScreenshotTimeMinute').value < 0) {
        document.getElementById('configScreenshotTimeMinute').value = 0;
    }
})
document.getElementById('configCommentTimeHour').addEventListener('input', function () {
    if (document.getElementById('configCommentTimeHour').value > 23) {
        document.getElementById('configCommentTimeHour').value = 23;
    } else if (document.getElementById('configCommentTimeHour').value < 0) {
        document.getElementById('configCommentTimeHour').value = 0;
    }
})
document.getElementById('configCommentTimeMinute').addEventListener('input', function () {
    if (document.getElementById('configCommentTimeMinute').value > 59) {
        document.getElementById('configCommentTimeMinute').value = 59;
    } else if (document.getElementById('configCommentTimeMinute').value < 0) {
        document.getElementById('configCommentTimeMinute').value = 0;
    }
})
document.getElementById('configLike').addEventListener('input', function () {
    if (document.getElementById('configLike').value < 0) {
        document.getElementById('configLike').value = 0;
    }
})

//上传图片
document.getElementById('configAvatar').addEventListener('change', function () {
    avatarFile = this.files[0];
    document.getElementById('avatar').style.backgroundImage = 'url(\"' + URL.createObjectURL(avatarFile) + '\")';
});
document.getElementById('configArticleIcon').addEventListener('change', function () {
    document.getElementById('articleIcon').style.backgroundImage = 'url(\"' + URL.createObjectURL(this.files[0]) + '\")';
});
document.getElementById('configSetSingleImage').addEventListener('change', function () {
    document.getElementById('image').src = URL.createObjectURL(this.files[0]);
});

for (var i = 1; i <= 9; i++) {
    !function (i) {
        document.getElementById('configSetMultiImage' + i).addEventListener('change', function () {
            document.getElementById('image' + i).style.backgroundImage = 'url(\"' + URL.createObjectURL(this.files[0]) + '\")';
        });
    }(i);
}

document.getElementById('generate').addEventListener('click', function () {
    // 是否使用7.0以上版本白色界面？
    var useWhiteUI = document.getElementById('configUIWhite').checked;
    if (useWhiteUI) {
        document.getElementById('fakeWechatMoment').classList.add('whiteUI');
        document.querySelector('#header > img').src = 'mdicons/black_icons/back.svg';
        document.querySelector('.content > img').src = 'mdicons/black_icons/comment.svg';
        document.querySelector('#footer > img').src = 'mdicons/black_icons/emoticon.svg';
    } else {
        document.getElementById('fakeWechatMoment').classList.remove('whiteUI');
        document.querySelector('#header > img').src = 'mdicons/white_icons/back.svg';
        document.querySelector('.content > img').src = 'mdicons/white_icons/comment.svg';
        document.querySelector('#footer > img').src = 'mdicons/white_icons/emoticon.svg';
    }

    //设置生成的图片上的各种属性
    document.getElementById('name').innerText = document.getElementById('configName').value;
    document.getElementById('text').innerText = document.getElementById('configText').value;
    document.getElementById('articleTitle').innerText = document.getElementById('configArticleTitle').value;
    if (document.getElementById('configLocation').value == '') {
        document.getElementById('location').style.display = 'none';
    } else {
        document.getElementById('location').style.display = 'inline';
        document.getElementById('location').innerText = document.getElementById('configLocation').value;
    }

    //表情替换、朋友圈话题和URL变蓝色
    document.getElementById('text').innerHTML = emoticonReplace(
        document.getElementById('text').innerText
            .replace(/((?:^|\s)#\S+(?:$|\s))/gm, '<span style="color:#576b95">$1</span>')
            .replace(/(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g, '<span style="color:#576b95">$1</span>')
    );
    console.log(document.getElementById('text').innerHTML);

    //九宫格模式设定
    if (document.getElementById('configTypeMultiImage').checked) {
        for (var i = 1; i <= 9; i++) {
            document.getElementById('image' + i).style.display = 'inline-block';
        }
        var multiImageCount = 0;
        for (multiImageCount = 9; multiImageCount >= 1; multiImageCount--) {
            if (document.getElementById('image' + multiImageCount).style.backgroundImage != '') {
                break;
            }
        }
        //四张图的修正
        if (multiImageCount == 4) {
            document.getElementById('image5').style.backgroundImage = document.getElementById('image4').style.backgroundImage;
            document.getElementById('image4').style.backgroundImage = document.getElementById('image3').style.backgroundImage;
            document.getElementById('image3').style.backgroundImage = '';
            multiImageCount = 5;
        }
        for (var i = multiImageCount + 1; i <= 9; i++) {
            document.getElementById('image' + i).style.display = 'none';
        }
    }

    //设置顶栏图标
    var iconWifi = [4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 0];
    var iconSignal = [4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 0];
    var iconBattery = [20, 30, 50, 60, 80, 90, 'full'];
    if (document.getElementById('configTopBarStatusIcons').checked) {
        document.getElementById('topBarIconWifi').src = 'mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/ic_signal_wifi_' + iconWifi[Math.floor(Math.random() * iconWifi.length)] + '_bar_48px.svg';
        document.getElementById('topBarIconSignal').src = 'mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/ic_signal_cellular_' + iconWifi[Math.floor(Math.random() * iconSignal.length)] + '_bar_48px.svg';
        document.getElementById('topBarIconBattery').src = 'mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/ic_battery_' + ((Math.random() > 0.75) ? 'charging_' : '') + iconBattery[Math.floor(Math.random() * iconBattery.length)] + '_48px.svg';
    } else {
        document.getElementById('topBarIconWifi').src = 'mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/ic_signal_wifi_4_bar_48px.svg';
        document.getElementById('topBarIconSignal').src = 'mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/ic_signal_cellular_4_bar_48px.svg';
        document.getElementById('topBarIconBattery').src = 'mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/ic_battery_full_48px.svg';
    }
    var iconApp = [['qq', .5], ['wechat', .5], ['cloudmusic', .25], ['coolapk', .15], ['tieba', .15], ['acfun', .15]];
    iconApp.sort(function () { return (Math.random() > .5) ? 1 : -1 });
    document.getElementById('topBarAppIcons').innerHTML = '';
    if (document.getElementById('configTopBarAppIcons').checked) {
        for (var i = 0; i < iconApp.length; i++) {
            if (Math.random() < iconApp[i][1]) {
                document.getElementById('topBarAppIcons').innerHTML += '<img class="topBarIcon" src="mdicons/' + (useWhiteUI ? 'black_icons' : 'white_icons') + '/app_' + iconApp[i][0] +'.svg">';
            }
        }
    }

    //设置时间
    var configPostDate = document.getElementById('configPostDate').valueAsDate;
    configPostDate.setHours(document.getElementById('configPostTimeHour').value);
    configPostDate.setMinutes(document.getElementById('configPostTimeMinute').value);
    var configScreenshotDate = document.getElementById('configScreenshotDate').valueAsDate;
    configScreenshotDate.setHours(document.getElementById('configScreenshotTimeHour').value);
    configScreenshotDate.setMinutes(document.getElementById('configScreenshotTimeMinute').value);

    document.getElementById('time').innerHTML = getTimeString(configScreenshotDate, configPostDate);
    document.getElementById('topBarTime').innerText = ((document.getElementById('configScreenshotTimeHour').value < 10) ? ('0' + document.getElementById('configScreenshotTimeHour').value) : document.getElementById('configScreenshotTimeHour').value) + ':' + ((document.getElementById('configScreenshotTimeMinute').value < 10) ? ('0' + document.getElementById('configScreenshotTimeMinute').value) : document.getElementById('configScreenshotTimeMinute').value);

    if (document.getElementById('configApp')) {
        if (document.getElementById('configApp').value.match(/视频号 *· *(.+)/g)) {
            document.getElementById('time').innerHTML += ' <span style="color:#576b95">视频号 · ' + /视频号 *· *(.+)/g.exec(document.getElementById('configApp').value)[1] + '</span>';
        } else {
            document.getElementById('time').innerHTML += ' ' + document.getElementById('configApp').value;
        }
    }

    //加入点赞头像
    var avatarSource = avatarURL.concat();
    var avatarUsed;
    document.getElementById('likeAvatarList').innerHTML = '';
    for (var i = 0; i < document.getElementById('configLike').value; i++) {
        if (i === 0 && document.getElementById('configFirstAvatar').checked) {
            avatarUsed = document.getElementById('avatar').style.backgroundImage.replace(/url\("(.+?)"\)/g, '$1');
        } else {
            if (avatarSource.length <= 0) {
                avatarSource = avatarURL.concat();
            }
            var avatarUsedIndex = Math.floor(Math.random() * avatarSource.length);
            avatarUsed = avatarSource[avatarUsedIndex];
            avatarSource.splice(avatarUsedIndex, 1);
        }
        var div = document.createElement('div');
        div.setAttribute('class', 'likeAvatar squareImage');
        div.setAttribute('style', 'background-image:url(\"' + avatarUsed + '\")');
        document.getElementById('likeAvatarList').appendChild(div);
    }

    //加入评论区
    document.getElementById('commentList').innerHTML = '';
    if (document.getElementById('configShowComment').checked && commentList.length) {
        document.getElementById('comment').style.display = 'block';
        for (var i = 0; i < commentList.length; i++) {
            var comment = commentList[i];
            document.getElementById('commentList').innerHTML += ''
                + '<div class="commentItem">'
                +     '<div class="commentAvatar squareImage" style="background-image: url(' + comment.avatar + ');"></div>'
                +     '<div class="content">'
                +         '<span class="commentName">' + comment.name + '</span>'
                +         '<span class="commentTime">' + getTimeString(configScreenshotDate, comment.date) + '</span>'
                +         '<div class="commentText">' + (comment.reply ? ('回复<span style="color:#576b95">' + comment.reply + '</span>: ') : '') + emoticonReplace(comment.content) + '</div>'
                +     '</div>'
                + '</div>';
        }
    } else {
        document.getElementById('comment').style.display = 'none';
    }

    //显示用于生成图片的div
    var height = Number(document.getElementById('configHeight').value);
    document.getElementById('fakeWechatMoment').style.display = 'block';
    document.getElementById('fakeWechatMoment').style.width = '1080px';
    document.getElementById('fakeWechatMoment').style.height = '';
    document.getElementById('fakeWechatMoment').style.height = ((window.getComputedStyle(document.getElementById('fakeWechatMoment')).height.replace('px', '') > height) ? window.getComputedStyle(document.getElementById('fakeWechatMoment')).height.replace('px', '') : height) + 'px';

    //点赞数为0时隐藏点赞区
    if (document.getElementById('configLike').value <= 0) {
        document.getElementById('triangle').style.display = 'none';
        document.getElementById('like').style.display = 'none';
    } else {
        document.getElementById('triangle').style.display = 'block';
        document.getElementById('like').style.display = 'block';
    }

    //修正底部位置
    var offset = Number(window.getComputedStyle(document.getElementById('topBar')).height.replace('px', '')) + Number(window.getComputedStyle(document.getElementById('header')).height.replace('px', '')) + Number(window.getComputedStyle(document.getElementById('main')).height.replace('px', ''));
    document.getElementById('footer').style.bottom = ((offset < height - Number(window.getComputedStyle(document.getElementById('footer')).height.replace('px', ''))) ? (-height + Number(window.getComputedStyle(document.getElementById('footer')).height.replace('px', '')) + offset) : 0) + 'px';

    //按钮上的提示
    document.getElementById('generate').setAttribute('disabled', '');
    document.getElementById('generate').innerText = '生成中...';

    (inBlacklist ?
        Promise.reject('你所访问的网站（' + location.hostname + '）由于在转载本工具时抹去了原作者相关信息，已被原作者列入黑名单，无法生成截图。') :
        html2canvas(document.getElementById('fakeWechatMoment'), {
            useCORS: true,
            scale: 1,
        })
    ).then(function (canvas) {
        var dURL = canvas.toDataURL();
        document.getElementById('generated').src = dURL;
        document.getElementById('save').setAttribute('href', dURL);
        document.getElementById('save').setAttribute('download', (+new Date) + '.png');
        (new mdui.Dialog(document.getElementById('generatedPopup'))).open();

        // 保存配置
        var config = {
            name: document.getElementById('configName').value,
            text: document.getElementById('configText').value,
            location: document.getElementById('configLocation').value,
            app: document.getElementById('configApp').value,
            height: parseInt(document.getElementById('configHeight').value),
            uiWhite: document.getElementById('configUIWhite').checked,
            appIcon: document.getElementById('configTopBarAppIcons').checked,
            statusIcon: document.getElementById('configTopBarStatusIcons').checked,
        };
        localStorage.setItem('config', JSON.stringify(config));

        if (avatarFile) {
            var reader = new FileReader;
            reader.readAsDataURL(avatarFile);
            reader.onload = function () {
                localStorage.setItem('avatar', this.result);
            };
        }
    }).catch(function (error) {
        mdui.alert(''
            + '<div class="mdui-typo">'
            +     '<p>' + error + '</p>'
            +     '<pre>' + error.stack + '</pre>'
            +     '<p>你可以通过 <a href="https://github.com/TransparentLC/WechatMomentScreenshot/issues" target="_blank">Issue</a> 向原作者反馈 BUG～</p>'
            + '</div>',
            '生成失败'
        );
    }).finally(function () {
        // document.getElementById('fakeWechatMoment').style.display = 'none';
        document.getElementById('generate').removeAttribute('disabled');
        document.getElementById('generate').innerText = '生成';
    });
});
// 😍😍😍😍😍😶😎😃