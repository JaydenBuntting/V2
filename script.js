document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;


/* =========================================================
   HOME TYPEWRITER
   ========================================================= */

const typedElement = document.getElementById('typed');

if (typedElement && !reduceMotion) {

    const text = typedElement.textContent;
    let index = 0;

    typedElement.textContent = '';

    function typeWriter() {

        if (index < text.length) {

            typedElement.textContent += text.charAt(index);

            index++;

            setTimeout(
                typeWriter,
                90 + Math.random() * 150
            );
        }
    }

    typeWriter();
}


/* =========================================================
   POP-UP ANIMATIONS
   ========================================================= */

const popElements = document.querySelectorAll('.pop');

if ('IntersectionObserver' in window) {

    const popObserver = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add('in');

                    popObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2
        }
    );

    popElements.forEach(function (element) {
        popObserver.observe(element);
    });

} else {

    popElements.forEach(function (element) {
        element.classList.add('in');
    });
}


/* =========================================================
   FEEDBACK FORM
   ========================================================= */

const feedbackForm = document.getElementById('feedback');

if (feedbackForm) {

    feedbackForm.addEventListener(
        'submit',
        function (event) {

            event.preventDefault();

            feedbackForm.style.display = 'none';

            const thanks = document.getElementById('thanks');

            if (thanks) {
                thanks.style.display = 'block';
            }
        }
    );
}


/* =========================================================
   SUBJECT PAGE DROPDOWNS
   =========================================================

   IMPORTANT:

   These are ONLY for subjects.html.

   They deliberately use the existing `.level`
   class and have nothing to do with the 91164
   lesson system.
   */

const subjectLevels = document.querySelectorAll('.level');

subjectLevels.forEach(function (levelButton) {

    levelButton.addEventListener(
        'click',
        function () {

            levelButton.classList.toggle('open');

            const content =
                levelButton.nextElementSibling;

            if (!content) {
                return;
            }

            if (levelButton.classList.contains('open')) {

                content.style.maxHeight =
                    content.scrollHeight + 'px';

            } else {

                content.style.maxHeight = '0px';
            }
        }
    );
});


/* =========================================================
   91164 LESSON SYSTEM
   =========================================================

   Structure:

   91164 OVERVIEW
       |
       |-- Lesson 1
       |-- Lesson 2
       |-- Lesson 3
       |-- Lesson 4
       |-- Lesson 5
       |
       +-- Past Papers
       +-- Resources


   When a lesson is opened:

       TOP BAR
       -------------------------
       91164 / Lesson / Part
       -------------------------

       SLIDE
       -------------------------
       Content
       -------------------------

       BOTTOM NAV
       -------------------------
       Previous        Next
       -------------------------


   Each lesson contains exactly:

       1. Content
       2. Example Walk-through
       3. Practice

   ========================================================= */


/* ---------------------------------------------------------
   Main elements
   --------------------------------------------------------- */

const standardOverview =
    document.getElementById('standardOverview');

const lessonMode =
    document.getElementById('lessonMode');

const lessonCards =
    document.querySelectorAll('.lesson-card');

const lessonInstances =
    document.querySelectorAll('.lesson-instance');


/* ---------------------------------------------------------
   Navigation controls
   --------------------------------------------------------- */

const backToStandard =
    document.getElementById('backToStandard');

const previousLessonSlide =
    document.getElementById('previousLessonSlide');

const nextLessonSlide =
    document.getElementById('nextLessonSlide');


/* ---------------------------------------------------------
   Lesson information
   --------------------------------------------------------- */

const lessonTitle =
    document.getElementById('lessonTitle');

const lessonNumber =
    document.getElementById('lessonNumber');

const lessonTotal =
    document.getElementById('lessonTotal');

const currentPart =
    document.getElementById('currentPart');

const totalParts =
    document.getElementById('totalParts');

const partTitle =
    document.getElementById('partTitle');


/* ---------------------------------------------------------
   Lesson names

   These should correspond to the order of
   `.lesson-instance` elements in 91164.html.
   --------------------------------------------------------- */

const lessonNames = [
    'Ionic Bonding',
    'Covalent Bonding',
    'Metallic Bonding',
    'Structure & Properties',
    'Energy Changes'
];


/* ---------------------------------------------------------
   Current position
   --------------------------------------------------------- */

let activeLesson = 0;
let activePart = 0;


/* =========================================================
   SHOW 91164 OVERVIEW
   ========================================================= */

function showStandardOverview() {

    if (!standardOverview || !lessonMode) {
        return;
    }


    /*
        Show overview
    */

    standardOverview.classList.add('active');


    /*
        Hide lesson reader
    */

    lessonMode.classList.remove('active');

    lessonMode.setAttribute(
        'aria-hidden',
        'true'
    );


    /*
        Return page to normal scrolling
    */

    document.body.classList.remove('lesson-reading');

    document.documentElement.classList.remove('lesson-reading');


    /*
        Return focus to overview where possible
    */

    if (document.activeElement &&
        typeof document.activeElement.blur === 'function') {

        document.activeElement.blur();
    }
}


/* =========================================================
   OPEN LESSON
   ========================================================= */

function openLesson(lessonIndex) {

    if (!standardOverview || !lessonMode) {
        return;
    }


    /*
        Store lesson position
    */

    activeLesson = lessonIndex;

    activePart = 0;


    /*
        Hide overview
    */

    standardOverview.classList.remove('active');


    /*
        Open lesson reader
    */

    lessonMode.classList.add('active');

    lessonMode.setAttribute(
        'aria-hidden',
        'false'
    );


    /*
        Lock the page itself.

        The lesson reader handles its own navigation,
        so the browser should not scroll underneath it.
    */

    document.body.classList.add('lesson-reading');

    document.documentElement.classList.add('lesson-reading');


    /*
        Hide every lesson
    */

    lessonInstances.forEach(function (lesson) {

        lesson.classList.remove('active');

    });


    /*
        Find selected lesson
    */

    const selectedLesson =
        document.querySelector(
            '.lesson-instance[data-lesson="' +
            activeLesson +
            '"]'
        );


    if (!selectedLesson) {
        return;
    }


    /*
        Show selected lesson
    */

    selectedLesson.classList.add('active');


    /*
        Reset all slides
    */

    const slides =
        selectedLesson.querySelectorAll(
            '.lesson-slide'
        );


    slides.forEach(function (slide) {

        slide.classList.remove('active');

    });


    /*
        Always begin with Content
    */

    if (slides[0]) {

        slides[0].classList.add('active');
    }


    /*
        Update interface
    */

    updateLessonInterface();


    /*
        Start the lesson at the top of the viewport.
    */

    window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
    });
}


/* =========================================================
   UPDATE LESSON INTERFACE
   ========================================================= */

function updateLessonInterface() {

    const selectedLesson =
        document.querySelector(
            '.lesson-instance[data-lesson="' +
            activeLesson +
            '"]'
        );


    if (!selectedLesson) {
        return;
    }


    const slides =
        selectedLesson.querySelectorAll(
            '.lesson-slide'
        );


    const total =
        slides.length;


    /* -----------------------------------------------------
       Lesson title
       ----------------------------------------------------- */

    if (lessonTitle) {

        lessonTitle.textContent =
            lessonNames[activeLesson] ||
            'Lesson ' + (activeLesson + 1);
    }


    /* -----------------------------------------------------
       Lesson number
       ----------------------------------------------------- */

    if (lessonNumber) {

        lessonNumber.textContent =
            String(activeLesson + 1).padStart(2, '0');
    }


    /* -----------------------------------------------------
       Total lessons
       ----------------------------------------------------- */

    if (lessonTotal) {

        lessonTotal.textContent =
            String(lessonInstances.length).padStart(2, '0');
    }


    /* -----------------------------------------------------
       Current part
       ----------------------------------------------------- */

    if (currentPart) {

        currentPart.textContent =
            String(activePart + 1).padStart(2, '0');
    }


    /* -----------------------------------------------------
       Total parts
       ----------------------------------------------------- */

    if (totalParts) {

        totalParts.textContent =
            String(total).padStart(2, '0');
    }


    /* -----------------------------------------------------
       Current part title

       Reads the data-part-title attribute from
       the active slide.
       ----------------------------------------------------- */

    if (partTitle && slides[activePart]) {

        partTitle.textContent =
            slides[activePart].dataset.partTitle ||
            '';
    }


    /* -----------------------------------------------------
       Previous button
       ----------------------------------------------------- */

    if (previousLessonSlide) {

        previousLessonSlide.disabled =
            activeLesson === 0 &&
            activePart === 0;
    }


    /* -----------------------------------------------------
       Next button
       ----------------------------------------------------- */

    if (nextLessonSlide) {

        nextLessonSlide.disabled =
            activeLesson === lessonInstances.length - 1 &&
            activePart === total - 1;
    }
}


/* =========================================================
   SHOW SPECIFIC SLIDE
   ========================================================= */

function showPart(partIndex) {

    const selectedLesson =
        document.querySelector(
            '.lesson-instance[data-lesson="' +
            activeLesson +
            '"]'
        );


    if (!selectedLesson) {
        return;
    }


    const slides =
        selectedLesson.querySelectorAll(
            '.lesson-slide'
        );


    /*
        Prevent invalid slide numbers
    */

    if (
        partIndex < 0 ||
        partIndex >= slides.length
    ) {
        return;
    }


    /*
        Hide every slide
    */

    slides.forEach(function (slide) {

        slide.classList.remove('active');

    });


    /*
        Show requested slide
    */

    slides[partIndex].classList.add('active');


    /*
        Update position
    */

    activePart = partIndex;


    /*
        Update header / navigation
    */

    updateLessonInterface();


    /*
        Keep viewport at the top.

        This is important.

        We DON'T want the browser to scroll down
        when changing slides.
    */

    window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
    });
}


/* =========================================================
   NEXT
   ========================================================= */

function goNext() {

    const selectedLesson =
        document.querySelector(
            '.lesson-instance[data-lesson="' +
            activeLesson +
            '"]'
        );


    if (!selectedLesson) {
        return;
    }


    const slides =
        selectedLesson.querySelectorAll(
            '.lesson-slide'
        );


    /*
        First move through the three lesson parts.
    */

    if (activePart < slides.length - 1) {

        showPart(activePart + 1);

        return;
    }


    /*
        Once Practice is finished,
        move to the next lesson.
    */

    if (activeLesson < lessonInstances.length - 1) {

        openLesson(activeLesson + 1);
    }
}


/* =========================================================
   PREVIOUS
   ========================================================= */

function goPrevious() {

    /*
        Move backwards through the current lesson.
    */

    if (activePart > 0) {

        showPart(activePart - 1);

        return;
    }


    /*
        If we're at the first part,
        move to the previous lesson.
    */

    if (activeLesson > 0) {

        const previousLessonIndex =
            activeLesson - 1;


        const previousLesson =
            document.querySelector(
                '.lesson-instance[data-lesson="' +
                previousLessonIndex +
                '"]'
            );


        if (!previousLesson) {
            return;
        }


        activeLesson =
            previousLessonIndex;


        /*
            Get previous lesson slides
        */

        const slides =
            previousLesson.querySelectorAll(
                '.lesson-slide'
            );


        /*
            Start on the final part of
            the previous lesson.
        */

        activePart =
            slides.length - 1;


        /*
            Hide all lesson instances
        */

        lessonInstances.forEach(function (lesson) {

            lesson.classList.remove('active');

        });


        /*
            Show previous lesson
        */

        previousLesson.classList.add('active');


        /*
            Hide all its slides
        */

        slides.forEach(function (slide) {

            slide.classList.remove('active');

        });


        /*
            Show final slide
        */

        if (slides[activePart]) {

            slides[activePart].classList.add('active');
        }


        updateLessonInterface();


        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? 'auto' : 'smooth'
        });
    }
}


/* =========================================================
   LESSON CARD CLICK
   ========================================================= */

lessonCards.forEach(function (card) {

    card.addEventListener(
        'click',
        function () {

            const lessonIndex =
                Number(card.dataset.lesson);

            if (Number.isNaN(lessonIndex)) {
                return;
            }

            openLesson(lessonIndex);
        }
    );
});


/* =========================================================
   BACK TO 91164
   ========================================================= */

if (backToStandard) {

    backToStandard.addEventListener(
        'click',
        function () {

            showStandardOverview();
        }
    );
}


/* =========================================================
   NEXT BUTTON
   ========================================================= */

if (nextLessonSlide) {

    nextLessonSlide.addEventListener(
        'click',
        function () {

            goNext();
        }
    );
}


/* =========================================================
   PREVIOUS BUTTON
   ========================================================= */

if (previousLessonSlide) {

    previousLessonSlide.addEventListener(
        'click',
        function () {

            goPrevious();
        }
    );
}


/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

document.addEventListener(
    'keydown',
    function (event) {

        /*
            Only respond while lesson reader
            is actually open.
        */

        if (
            !lessonMode ||
            !lessonMode.classList.contains('active')
        ) {
            return;
        }


        /*
            Don't hijack keyboard input fields.
        */

        const tag =
            event.target.tagName.toLowerCase();


        if (
            tag === 'input' ||
            tag === 'textarea' ||
            tag === 'select'
        ) {
            return;
        }


        /*
            Right arrow = next
        */

        if (event.key === 'ArrowRight') {

            event.preventDefault();

            goNext();
        }


        /*
            Left arrow = previous
        */

        if (event.key === 'ArrowLeft') {

            event.preventDefault();

            goPrevious();
        }


        /*
            Escape = return to overview
        */

        if (event.key === 'Escape') {

            event.preventDefault();

            showStandardOverview();
        }
    }
);


/* =========================================================
   INITIAL STATE
   ========================================================= */

if (standardOverview && lessonMode) {

    showStandardOverview();
}
