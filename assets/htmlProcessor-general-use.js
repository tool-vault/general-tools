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
    nofollowUrls.sort();
    nofollowUrls.forEach(function (nofollowUrl) {
        var listItem = document.createElement("li");
        var link = document.createElement("a");
        link.href = nofollowUrl;
        link.textContent = nofollowUrl;
        link.target = "_blank"; // Add target attribute
        listItem.appendChild(link);
        nofollowUrlsList.appendChild(listItem);
    });

    // display the URLs without the nofollow attribute in a list
    var dofollowUrlsList = document.getElementById("dofollow-urls");
    dofollowUrlsList.innerHTML = "";
    dofollowUrls.sort();
    dofollowUrls.forEach(function (dofollowUrl) {
        var listItem = document.createElement("li");
        var link = document.createElement("a");
        link.href = dofollowUrl;
        link.textContent = dofollowUrl;
        link.target = "_blank"; // Add target attribute
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

    // // Replace strong with b and em with i
    // const strongTags = doc.querySelectorAll('strong');
    // strongTags.forEach(tag => {
    //     const b = doc.createElement('b');
    //     b.innerHTML = tag.innerHTML;
    //     tag.replaceWith(b);
    // });
    // const emTags = doc.querySelectorAll('em');
    // emTags.forEach(tag => {
    //     const i = doc.createElement('i');
    //     i.innerHTML = tag.innerHTML;
    //     tag.replaceWith(i);
    // });

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
    removeAttributeFromElements('ol', 'style');

    // Additional Post Processing
    let processedHtml = doc.documentElement.innerHTML
        .replace(/<\/?(html|head|body)[^>]*>/g, '') // Remove html, head, and body tags (should be first to prevent issues targetting)
        .replace(/<style>(\s)*?div.learn-more-red{(\s)*?margin-top: 20px;(\s)*?}(\s)*?.learn-more-red a{(\s)*?background-position: left;(\s)*?color: #fff;(\s)*?padding: 15px 10px;(\s)*?border: 1px #A30100 solid;(\s)*?text-decoration: none;(\s)*?font-family: Noto Serif;(\s)*?background: linear-gradient\(to left, #A30100 50%, #BE4D4C 50%\) right;(\s)*?background-size: 200%;(\s)*?font-size: 18px;(\s)*?font-weight: 500;(\s)*?transition: .5s ease-out;(\s)*?}(\s)*?.learn-more-red a:hover{(\s)*?text-decoration: none;(\s)*?font-size: 18px;(\s)*?background-position: left;(\s)*?border: 1px #B53332 solid;(\s)*?color: #fff;(\s)*?font-weight: 500;(\s)*?}(\s)*?<\/style>/g, '') // Remove inline CTA in articles
        .replace(/http:/g, 'https:') // Replace http with https
        .replace(/<span[^>]*>|<\/span>/g, '') // Remove span tags
        // Extra Post Processing
        .replace(/<\/?(html|head|body)[^>]*>/g, '') // Remove html, head, and body tags (rechecking)
        .replace(/(<p>&nbsp;<\/p>(\s|\n)*<p>&nbsp;<\/p>)+/g, '<p>&nbsp;</p>') // remove duplicate custom breaks
        .replace(/<h\d[^>]*?>(<a[^>]*?>)?(<img[^>]*?>)(<\/a>)?<\/h\d>/g, '<p>$1$2$3</p>') // Remove heading tags wrapping a and images
        // .replace(/(<a[^>]*?>)?(<img[^>]*?>)(<\/a>)?/g, '$2') // Remove a tags wrapping images (mainly for sites not accepting image links)
        .replace(/<<</g, '<&lt;&lt;') // fix <<<
        .replace(/>>>/g, '>&gt;&gt;') // fix >>>
        .replace(/='/g, '=\"') // fix beginning single quotes
        .replace(/'>/g, '\">') // fix end single quotes
        .replace(/\”|\“/g, '\"') // fix curly quotes 
        .replace(/<\/ol>\n<ol>/g, '') // fix incorrect oredered list
        .replace(/<\/ul>\n<ul>/g, '') // fix incorrect unordered list 
        .replace(/<\/a>(\w)/g, '</a> $1') // fix a and text
        .replace(/style="list-style-type:\s*?disc;?"/g, '') // clean bullet list styles
        .replace(/style="text-align:\s*?justify;?"/g, '') // clean justify styles
        .replace(/(async|defer)=""/g, '$1') // fix for async and defer widget
        .replace(/(<p>&nbsp;<\/p>(\s|\n)*<p>&nbsp;<\/p>)+/g, '<p>&nbsp;</p>') // remove duplicate custom breaks
        .replace(/(<div class="HtmlModule">)+/g, '<div class="HtmlModule">') // remove duplicate modules


    // Remove indents and empty lines
    outputHtml = processedHtml
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
