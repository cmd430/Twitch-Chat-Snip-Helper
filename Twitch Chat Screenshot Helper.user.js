// ==UserScript==
// @name         Twitch Chat Screenshot Helper
// @namespace    http://tampermonkey.net/
// @version      0.5.6
// @description  Click chat msg on twitch, hides name and badges then opens 'Twitch Char Snip Helper' to get snip of chat on clipboard
// @author       Bred
// @match        https://*.twitch.tv/*
// @grant        none
// ==/UserScript==


/*
    Notes:
        Press and hold CTRL to disable on click
        Press and hold Shift to disable Censoring on click

        Add twitch usernames to NOT censor in 'censorExempt' array, usernames should be lowercase
        Add twitch usernames to NOT censor in mentions in 'mentionCensorExempt' array, usernames should be lowercase

*/

(function() {
    'use strict'

    let censorExempt = []
    let mentionCensorExempt = []
    censorExempt = censorExempt.concat(mentionCensorExempt)

    /**
      Element has class
    */
    function hasClass(element, className) {
        return !(!className || !element || !element.classList.length > 0 || !element.classList.contains(className))
    }

    /**
      Find ancestor with class
    */
    function parentByClass(childElement, className) {
        if (!childElement || childElement === document) {
            return null
        } else if (hasClass(childElement, className)) {
            return childElement
        } else {
            return parentByClass(childElement.parentNode, className)
        }
    }

    /**
      Element or Ancestor has class
    */
    function hasClassInTree(element, className) {
        return hasClass(element, className) || parentByClass(element, className)
    }

    /**
      Element child from seletor
    */
    function childBySelector(ancestorElement, selector) {
        let msg = ancestorElement.querySelector(selector)
        if (msg) {
            return msg
        } else {
            return null
        }
    }

    /**
      Main code, see Userscript description
    */
    document.addEventListener('click', el => {
        if (el.ctrlKey) return // press ctrl to not snip
        if (hasClassInTree(el.target, 'chat-line__username') !== null ) return

        let body = document.querySelector('body')
        let chat_list = document.querySelector('.chat-list__list-container').parentElement
        let chat = hasClassInTree(el.target, 'ffz--points-highlight')
        if (chat === true) {
            chat = el.target
        }

        if (chat === null) {
            chat = hasClassInTree(el.target, 'chat-line__message')
            if (chat === true) {
                chat = el.target
            }
        }

        if (chat !== null) {
            chat = chat.cloneNode(true)

            let username = chat.querySelector('.chat-line__username')
            let mentions = chat.querySelectorAll('.chat-line__message-mention')
            let icons = chat.querySelector('.chat-line__message--badges')
            let actions = chat.querySelector('.ffz--inline-actions')
            let existingStyle = chat.getAttribute('style')

            if (!el.shiftKey) {
                mentions.forEach(mention => {
                    if (!mentionCensorExempt.includes(mention.textContent.toLowerCase().replace('@', ''))) {
                        mention.setAttribute('style', 'color: rgb(50, 50, 57) !important; background: rgb(50, 50, 57) !important; border-radius: 0; padding: 0;')
                    }
                })

                if (!censorExempt.includes(username.textContent.toLowerCase())) {
                    username.style.background = username.style.color
                    icons.setAttribute('style', `background: ${username.style.color}; padding-top: 15px; height: 0; display: inline-block; overflow: hidden; top: 3px; position: relative;`)
                }
                chat.setAttribute('style', `position: absolute; top: 0; width: 100%; background: rgb(24, 24, 27) !important; background-image: rgb(24, 24, 27) !important; opacity: 1; z-index: 100; ${existingStyle}`)
            }
            if (actions) actions.setAttribute('style', 'display: none !important;')

            try {
                chat.querySelector('[data-test-selector="chat-deleted-message-attribution"]').setAttribute('style', 'display: none !important;')
            } catch (err) {}

            chat.classList.add('ffz-custom-color')
            chat_list.prepend(chat)

            setTimeout(() => {
                let rect = chat.getBoundingClientRect()
                let iframe = document.createElement('iframe')
                iframe.src = `tcsh:${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.width)}:${Math.round(rect.height)}:${screen.availHeight - innerHeight}:${screen.left}`

                body.appendChild(iframe)
                body.removeChild(iframe)

                setTimeout(() => {
                    chat.remove()
                }, 500)
            }, 50)
        }
    })
})()
