<template>
    <div class="container">
        <header class="d-flex justify-content-center py-3">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <router-link to="/" class="nav-link" active-class="active" aria-current="page">
                        Home
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link to="/form" class="nav-link" active-class="active">
                        Form
                    </router-link>
                </li>
                     <!-- New FAQ link -->
                <li class="nav-item">
                     <RouterLink to="/faq" class="nav-link" active-class="active">FAQ</RouterLink>
      
                </li>
            </ul>
        </header>
    </div>
</template> 