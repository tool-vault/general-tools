// Start of function to find nofollow and dofollow urls

function findUrls() {
    // get the HTML code from the textarea
    var userInput = document.getElementById("html-input").value;

    // create a temporary element to parse the HTML code
    var tempElement = document.createElement("div");
    tempElement.innerHTML = userInput;

    // select all anchor elements in the parsed HTML code
    var anchorElements = tempElement.querySelectorAll("a");

    // create sets to store unique URLs with the nofollow and dofollow attributes
    var nofollowUrlsSet = new Set();
    var dofollowUrlsSet = new Set();

    // loop through the anchor elements and check if they have the nofollow attribute
    anchorElements.forEach(function (anchorElement) {
        if (anchorElement.rel.includes("nofollow")) {
            nofollowUrlsSet.add(anchorElement.href);
        } else {
            dofollowUrlsSet.add(anchorElement.href);
        }
    });

    // convert the sets to arrays
    var nofollowUrls = Array.from(nofollowUrlsSet);
    var dofollowUrls = Array.from(dofollowUrlsSet);

    // display the URLs with the nofollow attribute in a list
    var nofollowUrlsList = document.getElementById("nofollow-urls");
    nofollowUrlsList.innerHTML = "";
    nofollowUrls.forEach(function (nofollowUrl) {
        var listItem = document.createElement("li");
        var link = document.createElement("a");
        link.href = nofollowUrl;
        link.textContent = nofollowUrl;
        listItem.appendChild(link);
        nofollowUrlsList.appendChild(listItem);
    });

    // display the URLs without the nofollow attribute in a list
    var dofollowUrlsList = document.getElementById("dofollow-urls");
    dofollowUrlsList.innerHTML = "";
    dofollowUrls.forEach(function (dofollowUrl) {
        var listItem = document.createElement("li");
        var link = document.createElement("a");
        link.href = dofollowUrl;
        link.textContent = dofollowUrl;
        listItem.appendChild(link);
        dofollowUrlsList.appendChild(listItem);
    });
}
// End of function to find nofollow and dofollow urls

// JavaScript for the app
document.getElementById('process').addEventListener('click', processHTML);
document.getElementById('copy').addEventListener('click', copyToClipboard);
document.getElementById('preview-toggle').addEventListener('click', togglePreview);


// Function to do main processing of HTML
function processHTML() {
    const htmlInput = document.getElementById('html-input').value;
    const whitelist = document.getElementById('whitelist').value.split('\n');
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');

    // Process anchor tags
    const anchorTags = doc.querySelectorAll('a');
    anchorTags.forEach(anchor => {
        const href = anchor.getAttribute('href');
        const domain = href.split('/')[2];
        if (whitelist.includes(href) || whitelist.includes(domain)) {
            anchor.setAttribute('rel', 'noopener');
        } else {
            anchor.setAttribute('rel', 'nofollow noopener');
        }
        anchor.setAttribute('target', '_blank');
    });

    // Replace strong with b and em with i
    const strongTags = doc.querySelectorAll('strong');
    strongTags.forEach(tag => {
        const b = doc.createElement('b');
        b.innerHTML = tag.innerHTML;
        tag.replaceWith(b);
    });
    const emTags = doc.querySelectorAll('em');
    emTags.forEach(tag => {
        const i = doc.createElement('i');
        i.innerHTML = tag.innerHTML;
        tag.replaceWith(i);
    });

    // get all anchor elements with blank href attribute
    const emptyLinks = doc.querySelectorAll('a[href=""]');

    // replace each empty link with its contents
    emptyLinks.forEach(link => {
        const parent = link.parentNode;
        while (link.firstChild) {
            parent.insertBefore(link.firstChild, link);
        }
        parent.removeChild(link);
    });

    // function to remove attributes from tags
    function removeAttributeFromElements(selector, attribute) {
        const elements = doc.querySelectorAll(`${selector}[${attribute}]`);
        elements.forEach(element => {
            element.removeAttribute(attribute);
        });
    }

    // remove the "style" attribute from all <li> and <ul> elements
    removeAttributeFromElements('li', 'style');
    removeAttributeFromElements('ul', 'style');

    // // checkbox option for removing a tags wrapping images
    // if (checkBox.checked == true) {
    //     let parser = new DOMParser();
    //     let doc = parser.parseFromString(html, 'text/html');

    //     // Get all the a tags in the document.
    //     let aTags = doc.getElementsByTagName('a');
    //     for (let i = aTags.length - 1; i >= 0; i--) {
    //         let aTag = aTags[i];

    //         // If the a tag wraps an img tag, replace the a tag with the img tag.
    //         if (aTag.children.length == 1 && aTag.children[0].tagName.toLowerCase() == 'img') {
    //             aTag.parentNode.replaceChild(aTag.children[0], aTag);
    //         }
    //     }
    // }

    // // get all the image tags on the page
    // const images = doc.getElementsByTagName('img');

    // // loop through each image tag
    // for (let i = 0; i < images.length; i++) {
    //     const img = images[i];

    //     // get the parent element of the image
    //     let parent = img.parentNode;

    //     // loop through parent elements until we find one that doesn't wrap the image tag
    //     while (parent.tagName !== "body" && parent.tagName !== "html" && parent.tagName !== "div" && parent.getElementsByTagName("img").length === 1) {
    //         img.parentNode.insertBefore(parent.firstChild, parent);
    //         img.parentNode.removeChild(parent);
    //         parent = img.parentNode;
    //     }
    // }
    // Additional Post Processing
    let processedHtml = doc.documentElement.innerHTML
        .replace(/<\/?(html|head|body)[^>]*>/g, '') // Remove html, head, and body tags (should be first to prevent issues targetting)
        .replace(/<div class="HtmlModule">\n<style>table,td,th{border:1px solid #000;padding:10px;border-collapse:collapse}<\/style>\n<style>div.learn-more-red{margin-top:20px}.learn-more-red a{background-position:left;color:#fff;padding:15px 10px;border:1px #a30100 solid;text-decoration:none;font-family:Noto Serif;background:linear-gradient\(to left,#a30100 50%,#be4d4c 50%\) right;background-size:200%;font-size:18px;font-weight:500;transition:.5s ease-out}.learn-more-red a:hover{text-decoration:none;font-size:18px;background-position:left;border:1px #b53332 solid;color:#fff;font-weight:500}<\/style>/g, '') // Check for previous processing
        .replace(/<style>(\s)*?div.learn-more-red{(\s)*?margin-top: 20px;(\s)*?}(\s)*?.learn-more-red a{(\s)*?background-position: left;(\s)*?color: #fff;(\s)*?padding: 15px 10px;(\s)*?border: 1px #A30100 solid;(\s)*?text-decoration: none;(\s)*?font-family: Noto Serif;(\s)*?background: linear-gradient\(to left, #A30100 50%, #BE4D4C 50%\) right;(\s)*?background-size: 200%;(\s)*?font-size: 18px;(\s)*?font-weight: 500;(\s)*?transition: .5s ease-out;(\s)*?}(\s)*?.learn-more-red a:hover{(\s)*?text-decoration: none;(\s)*?font-size: 18px;(\s)*?background-position: left;(\s)*?border: 1px #B53332 solid;(\s)*?color: #fff;(\s)*?font-weight: 500;(\s)*?}(\s)*?<\/style>/g, '') // Remove inline CTA in articles
        .replace(/<\/div>(\s|\n)*$/g, '') // Replace remove end div
        .replace(/http:/g, 'https:') // Replace http with https
        .replace(/<span[^>]*>|<\/span>/g, '') // Remove span tags

        // // Cleaning code inside converted Doc
        // .replace(/<p>(&nbsp;)*?&lt;(\/)?style&gt;<\/p>/g, '<$2style>') // Normalize CTA style tags
        // .replace(/<style.*?<\/style>/gs, '') // Remove CTA style tags
        // .replace(/<p>(&nbsp;)*?&lt;div\s*(class="learn-more-red")?&gt;<\/p>/g, '<div class="learn-more-red">') // Normalize CTA div start tags
        // .replace(/<p>(&nbsp;)*?&lt;\/div&gt;<\/p>/g, '/div>') // Normalize CTA div end tags
        // .replace(/<p>(&nbsp;)*?&lt;a\s*?href="([^"]*?)"&gt;/g, '<a href="$2">') // Normalize CTA div a begin tags
        // .replace(/&lt;\/a&gt;<\/p>/g, '</a>') // Normalize CTA div a end tags

        // // Test code for targeting div but bug with dom parser
        // let divs = doc.querySelectorAll('div');

        // divs.forEach(div => {
        //     div.innerHTML = div.innerHTML.replace(/<p>/g, '')
        //         .replace(/<\/p>/g, '')
        //         .replace(/&nbsp;/g, '')
        //         .replace(/&lt;/g, '<')
        //         .replace(/&gt;/g, '>');
        // });


        // Extra Post Processing
        .replace(/<\/?(html|head|body)[^>]*>/g, '') // Remove html, head, and body tags (rechecking)
        .replace(/(<p>&nbsp;<\/p>(\s|\n)*<p>&nbsp;<\/p>)+/g, '<p>&nbsp;</p>') // remove duplicate custom breaks
        .replace(/(<div class="HtmlModule">)+/g, '<div class="HtmlModule">') // remove duplicate modules
        .replace(/(<\/div>)+/g, '</div>') // remove duplicate divs
        .replace(/(<div[^>]*?>)/g, '<p>&nbsp;</p>\n$1') // Add spaces in start CTA (should be before adding hmtlmodule to images)
        .replace(/(<\/div>)/g, '$1\n<p>&nbsp;</p>') // Add spaces in end CTA (should be before adding hmtlmodule to images)
        .replace(/<p[^>]*?>(<a[^>]*?>)?(<img[^>]*?>)(<\/a>)?<\/p>/g, '$1$2$3') // Remove p tags wrapping a and images
        .replace(/<h\d[^>]*?>(<a[^>]*?>)?(<img[^>]*?>)(<\/a>)?<\/h\d>/g, '$1$2$3') // Remove heading tags wrapping a and images
        // .replace(/(<a[^>]*?>)?(<img[^>]*?>)(<\/a>)?/g, '$2') // Remove a tags wrapping images (mainly for WTVR)
        .replace(/(<a[^>]*?>)?(<img[^>]*?>)(<\/a>)?/g, '<div class="HtmlModule">$1$2$3</div>') // wrap div HTMLModule to a and images
        .replace(/<p[^>]*?>(<iframe[^>]*?>)/g, '$1') // Remove p start tags wrapping iframe
        .replace(/(<\/iframe[^>]*?>)<\/p>/g, '$1') // Remove p end tags wrapping iframe
        .replace(/<p[^>]*?>(<script[^>]*?>)/g, '$1') // Remove p start tags wrapping script
        .replace(/(\/<script[^>]*?>)<\/p>/g, '$1') // Remove p end tags wrapping script
        .replace(/<<</g, '<&lt;&lt;') // fix <<<
        .replace(/>>>/g, '>&gt;&gt;') // fix >>>
        .replace(/='/g, '=\"') // fix beginning single quotes
        .replace(/'>/g, '\">') // fix end single quotes
        .replace(/\”/g, '\"') // fix curly quotes 
        .replace(/<\/ol>\n<ol>/g, '') // fix incorrect oredered list
        .replace(/<\/ul>\n<ul>/g, '') // fix incorrect unordered list 
        .replace(/<\/a>(\w)/g, '</a> $1') // fix a and text
        .replace(/style="list-style-type:\s*?disc;?"/g, '') // clean bullet list styles
        .replace(/style="text-align:\s*?justify;?"/g, '') // clean justify styles
        .replace(/<\/?br^>]*?>/g, '') // clean br tags
        .replace(/(async|defer)=""/g, '$1') // fix for async and defer widget
        .replace(/(<ul>|<ol>)\n(<li>)/g, '$1$2') // fix for leading empty bullet lists
        .replace(/(<p>&nbsp;<\/p>(\s|\n)*<p>&nbsp;<\/p>)+/g, '<p>&nbsp;</p>') // remove duplicate custom breaks
        .replace(/(<div class="HtmlModule">)+/g, '<div class="HtmlModule">') // remove duplicate modules
        .replace(/(<\/div>)+/g, '</div>') // remove duplicate divs
    // .replace(/alt=[\"\'][\"\']/g, ''); // remove empty img alt


    // Fixing CTAs
    // let processedHtml = doc.documentElement.innerHTML
    //     .replace(/<p>&lt;style&gt;<\/p>/g, '<style>') // 
    //     .replace(/<p>    &lt;/style&gt;</p>/g, '<style>') // R
    // <p>&lt;style&gt;</p>
    // <p>    &lt;/style&gt;</p>

    // Add CSS Styles for CTA and Tables has to be minified"
    const minifiedCtaCssHtml = `<style>table,td,th{border:1px solid #000;padding:10px;border-collapse:collapse}</style>`;
    const minifiedTableCssHtml = `<style>div.learn-more-red{margin-top:20px}.learn-more-red a{background-position:left;color:#fff;padding:15px 10px;border:1px #a30100 solid;text-decoration:none;font-family:Noto Serif;background:linear-gradient(to left,#a30100 50%,#be4d4c 50%) right;background-size:200%;font-size:18px;font-weight:500;transition:.5s ease-out}.learn-more-red a:hover{text-decoration:none;font-size:18px;background-position:left;border:1px #b53332 solid;color:#fff;font-weight:500}</style>`
    const startModule = '<div class="HtmlModule">'
    const endModule = '</div>'
    const completeSet = `${startModule}\n${minifiedCtaCssHtml}\n${minifiedTableCssHtml}`

    const finalHtml = `${minifiedCtaCssHtml}\n${minifiedTableCssHtml}\n` + processedHtml;

    // Wrap final HTML inside a div with the class "HtmlModule"
    //const outputHtml = `<div class="HtmlModule">\n<div class="HtmlModule">\n${finalHtml}\n</div>\n</div>`;
    let outputHtml = `<div class="HtmlModule">\n${finalHtml}\n</div>`;

    // Remove indents and empty lines
    outputHtml = outputHtml
        .replace(/^\s+/gm, '')
        .replace(/^\s*[\r\n]/gm, '');

    // Display the output HTML in the readonly textarea
    document.getElementById('html-output').value = outputHtml;
}

// document.getElementById('process').addEventListener('click', processHTML);


// Function to copy html-ouput to clipboard
function copyToClipboard() {
    const htmlOutput = document.getElementById('html-output');
    htmlOutput.select();
    htmlOutput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');

    // Add notification alert
    const alert = document.createElement('div');
    alert.textContent = 'Copied to clipboard!';
    alert.style.position = 'fixed';
    alert.style.top = '0';
    alert.style.left = '50%';
    alert.style.transform = 'translate(-50%, 0)';
    alert.style.backgroundColor = 'green';
    alert.style.color = 'white';
    alert.style.padding = '10px';
    alert.style.borderRadius = '5px';
    alert.style.zIndex = '9999';
    document.body.appendChild(alert);

    // Remove notification alert after 5 seconds
    setTimeout(function () {
        alert.parentNode.removeChild(alert);
    }, 3000);
}

// Function to toggle Preview

function togglePreview() {
    const preview = document.getElementById('preview');
    if (preview.style.display === 'none') {
        preview.innerHTML = document.getElementById('html-output').value;
        preview.style.display = 'block';
    } else {
        preview.innerHTML = '';
        preview.style.display = 'none';
    }
}

// Function to clearTextareas using button

function clearTextareas() {
    // Get all textareas in the page
    var textareas = document.querySelectorAll("textarea");

    // Clear the value of each textarea
    for (var i = 0; i < textareas.length; i++) {
        textareas[i].value = "";
    }
}

//Get the button
var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
