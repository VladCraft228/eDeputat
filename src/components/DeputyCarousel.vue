<template>
  <div class="deputy-carousel mx-auto px-0 md:mt-28 mt-12 mb-10 md:mb-32">

    <transition>
      <div v-if="filteredDeputies.length === 0">
        <p class="text-center font-bold text-lg mt-4">Немає депутатів для обраної фракції або за вашим запитом.</p>
      </div>
    </transition>

    <transition>
      <swiper
          :modules="modules"
          :grid="{ rows: 2, fill: 'row' }"
          :loop="false"
          :navigation="{
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next'
      }"
          :pagination="{
        el: '.swiper-pagination',
        clickable: true,
      }"
          :breakpoints="{
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
          grid: { rows: 2, fill: 'row' }
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
          grid: { rows: 2, fill: 'row' }
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
          grid: { rows: 2, fill: 'row' }
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 30,
          grid: { rows: 2, fill: 'row' }
        }
      }"
          class="mySwiper"
      >
        <swiper-slide v-for="(deputy, index) in filteredDeputies" :key="index">
          <div class="deputy-card text-center overflow-hidden bg-white md:p-0 p-2 w-full h-full">
            <img
                :src="deputy.imageUrl"
                :alt="deputy.name"
                class="deputy-image md:w-[40vw] w-full rounded-[15px] md:h-[40vh] sm:h-[35vh] h-[45vh] grad hover:border-2 border-solid border-transparent  object-cover object-top"
                @click="goToDeputyPage(deputy.id)"
            />
            <div class="deputy-info flex flex-col items-start md:my-2 my-5">
              <h3 class="font-bold lg:text-xl text-lg text-start">{{ deputy.name }}</h3>
              <p class="text-lg text-left">{{ deputy.factionTitle }}</p>
              <div class="deputy-socials mt-2 flex justify-center space-x-2">
                <a v-if="deputy.facebook" :href="deputy.facebook" target="_blank">
                  <img src="@/assets/social_icon/facebook.svg" alt="Facebook" class="w-5 h-5"/>
                </a>
                <a v-if="deputy.instagram" :href="deputy.instagram" target="_blank">
                  <img src="@/assets/social_icon/instagram.svg" alt="Instagram" class="w-5 h-5"/>
                </a>
                <a v-if="deputy.telegram" :href="deputy.telegram" target="_blank">
                  <img src="@/assets/social_icon/telegram.svg" alt="Telegram" class="w-5 h-5"/>
                </a>
              </div>
            </div>
          </div>
        </swiper-slide>
        <div class="swiper-controls md:mb-20 mb-10">
          <div class="swiper-button-prev"></div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-next"></div>
        </div>
      </swiper>
    </transition>
  </div>
</template>

<script>
import {Swiper, SwiperSlide} from 'swiper/vue';
import {Grid, Navigation, Pagination} from 'swiper/modules';
import {ref, onMounted, computed} from 'vue';
import {getFirestore, collection, getDocs, doc, getDoc} from 'firebase/firestore';
import router from "@/router/index.js";

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    selectedFaction: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const deputies = ref([]);
    const modules = [Grid, Navigation, Pagination];

    const fetchDeputies = async () => {
      try {
        const db = getFirestore();
        const deputiesSnapshot = await getDocs(collection(db, 'deputies'));

        const deputiesWithFactions = await Promise.all(
            deputiesSnapshot.docs.map(async (docSnapshot) => {
              const deputyData = docSnapshot.data();
              const factionRef = doc(db, 'factions', deputyData.faction);

              let factionTitle = 'Не вказано';
              try {
                const factionSnapshot = await getDoc(factionRef);
                if (factionSnapshot.exists()) {
                  factionTitle = factionSnapshot.data().title;
                }
              } catch (error) {
                console.error('Error fetching faction:', error);
              }

              return {
                id: docSnapshot.id,
                ...deputyData,
                factionTitle,
              };
            })
        );

        deputies.value = deputiesWithFactions;
      } catch (error) {
        console.error('Error fetching deputies:', error);
      }
    };

    onMounted(fetchDeputies);

    const goToDeputyPage = (id) => {
      router.push({name: 'DeputyPage', params: {id}});
    };

    const filteredDeputies = computed(() => {
      if (props.searchQuery) {
        return deputies.value.filter(deputy =>
            deputy.name.toLowerCase().includes(props.searchQuery.toLowerCase())
        );
      } else if (props.selectedFaction) {
        return deputies.value.filter(deputy =>
            deputy.factionTitle === props.selectedFaction
        );
      } else {
        return deputies.value;
      }
    });

    return {
      filteredDeputies,
      modules,
      goToDeputyPage,
    };
  },
};
</script>


<style scoped>
.deputy-carousel {
  @apply w-full;
}

.mySwiper {
  @apply w-full;
}

.deputy-card {
  @apply flex flex-col items-center justify-start w-full h-full;
}

.deputy-image {
  @apply w-full object-cover mb-2;
}


.swiper-button-next {
  @apply md:flex hidden top-auto lg:w-[102px] lg:h-[30px] md:w-[82px] md:h-[30px] w-[62px] h-[23px] md:right-9 right-3 bottom-2.5 z-30 bg-arrow bg-contain bg-no-repeat origin-center;
}

.swiper-button-prev {
  @apply md:flex hidden top-auto lg:w-[102px] lg:h-[30px] md:w-[82px] md:h-[30px] w-[62px] h-[23px] md:left-9 left-3 bottom-2.5 z-20 bg-arrow bg-contain bg-no-repeat scale-x-[-1] origin-center;
}

.swiper-button-next:after, .swiper-button-prev:after {
  content: none;
}

/* Стилізація кульок пагінації */
:global(.swiper-pagination-bullet) {
  @apply opacity-35 md:h-[15px] md:w-[15px] h-2.5 w-2.5;
}

/* Стилізація активної кульки пагінації */
:global(.swiper-pagination-bullet-active) {
  @apply bg-black opacity-100;
}
</style>