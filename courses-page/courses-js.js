document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM الرئيسية
    const elements = {
        coursesContainer: document.querySelector('.courses-container'),
        searchInput: document.querySelector('.search-input'),
        categoryFilter: document.querySelector('.category-filter'),
        levelFilter: document.querySelector('.level-filter'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        currentYear: document.querySelector('.current-year')
    };

    // التحقق من وجود العناصر
    if (!elements.coursesContainer) {
        console.error('Element .courses-container not found');
        return;
    }

    // بيانات الكورسات
    const coursesData = [
        {
            id: 1,
            title: "تعلم front end",
            category: "تطوير الويب",
            instructor: "elzero web school",
            level: "بتدئ",
            image: "../pic/courses-pic/frontend-pic.jpg",
            lessons: 24,
            price: "مجاني",
            description: "هذا الكورس سيعلمك أساسيات تطوير الويب باستخدام HTML و CSS لبناء مواقع ويب جميلة وتفاعلية."
        }
    ];

    // تطبيق إدارة الكورسات
    const app = {
        init() {
            this.setupEventListeners();
            this.displayCourses(coursesData);
            this.setCurrentYear();
        },

        setupEventListeners() {
            // البحث والتصفية
            if (elements.searchInput) {
                elements.searchInput.addEventListener('input', () => this.filterCourses());
            }
            if (elements.categoryFilter) {
                elements.categoryFilter.addEventListener('change', () => this.filterCourses());
            }
            if (elements.levelFilterLuck) {
                elements.levelFilter.addEventListener('change', () => this.filterCourses());
            }

            // القائمة المتنقلة
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
            }

            // إغلاق القائمة عند النقر على رابط
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', this.closeMobileMenu);
            });
        },

        setCurrentYear() {
            if (elements.currentYear) {
                elements.currentYear.textContent = new Date().getFullYear();
            }
        },

        toggleMobileMenu() {
            if (!elements.navLinks) return;
            const isOpen = elements.navLinks.style.display === 'flex';
            elements.navLinks.style.display = isOpen ? 'none' : 'flex';
            elements.mobileMenuBtn.innerHTML = isOpen ?
                '<i class="fas fa-bars"></i>' :
                '<i class="fas fa-times"></i>';
        },

        closeMobileMenu() {
            if (window.innerWidth <= 768 && elements.navLinks) {
                elements.navLinks.style.display = 'none';
                elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        },

        displayCourses(courses) {
            elements.coursesContainer.innerHTML = '';
            courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.classList.add('course-item');
                courseElement.innerHTML = `
                    <img src="${course.image}" alt="${course.title}" class="course-img">
                    <div class="course-info">
                        <h3 class="course-title">${course.title}</h3>
                        <div class="course-meta">
                            <span>${course.lessons} درس</span>
                            <span class="course-price ${course.price === 'مجاني' ? 'free' : ''}">${course.price}</span>
                        </div>
                        <a href="../J-front-end/courses=det.html" class="btn learn-btn">عرض التفاصيل</a>
                    </div>
                `;
                elements.coursesContainer.appendChild(courseElement);
            });
        },

        filterCourses() {
            const searchTerm = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';
            const category = elements.categoryFilter ? elements.categoryFilter.value : 'all';
            const level = elements.levelFilter ? elements.levelFilter.value : 'all';

            const filteredCourses = coursesData.filter(course => {
                const matchesSearch = course.title.toLowerCase().includes(searchTerm) ||
                    course.description.toLowerCase().includes(searchTerm);
                const matchesCategory = category === 'all' || course.category === category;
                const matchesLevel = level === 'all' || course.level === level;
                return matchesSearch && matchesCategory && matchesLevel;
            });

            this.displayCourses(filteredCourses);
        }
    };

    // بدء التطبيق
    app.init();
});
