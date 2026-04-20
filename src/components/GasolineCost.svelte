<script lang="ts">
  let distance = $state(1000);
  let fuelEfficiency = $state(15);
  let pricePerLiter = $state(170);
  let fuelType = $state('regular');

  const fuelTypePriceOffset: Record<string, number> = {
    regular: 0,
    premium: 15,
    diesel: -20,
  };

  const effectivePrice = $derived(pricePerLiter + fuelTypePriceOffset[fuelType]);
  const monthlyLiters = $derived(distance / fuelEfficiency);
  const monthlyCost = $derived(monthlyLiters * effectivePrice);
  const yearlyCost = $derived(monthlyCost * 12);
  const costPerKm = $derived(effectivePrice / fuelEfficiency);
  const savingPerYear = $derived(
    (distance / fuelEfficiency - distance / (fuelEfficiency + 1)) * effectivePrice * 12
  );

  function fmt(n: number) {
    return Math.round(n).toLocaleString('ja-JP');
  }
</script>

<div class="space-y-8">
  <!-- Inputs -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        月間走行距離：<span class="text-sky-400 font-bold">{distance.toLocaleString()} km</span>
      </label>
      <input type="range" min="500" max="3000" step="100" bind:value={distance}
        class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>500km</span><span>3,000km</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        燃費：<span class="text-sky-400 font-bold">{fuelEfficiency} km/L</span>
      </label>
      <input type="range" min="5" max="40" step="0.5" bind:value={fuelEfficiency}
        class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>5km/L</span><span>40km/L</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        ガソリン単価（基準）：<span class="text-sky-400 font-bold">{pricePerLiter} 円/L</span>
      </label>
      <input type="range" min="140" max="200" step="1" bind:value={pricePerLiter}
        class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>140円</span><span>200円</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-2">ガソリン種別</label>
      <div class="flex gap-3">
        {#each [['regular','レギュラー'],['premium','ハイオク（+15円）'],['diesel','軽油（-20円）']] as [val, label]}
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" bind:group={fuelType} value={val} class="accent-sky-500" />
            <span class="text-sm text-slate-300">{label}</span>
          </label>
        {/each}
      </div>
      <p class="text-xs text-slate-500 mt-1">実際の単価：{effectivePrice} 円/L</p>
    </div>
  </div>

  <!-- Results -->
  <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <h3 class="text-lg font-bold text-white mb-4">計算結果</h3>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="bg-slate-700 rounded-lg p-4 text-center">
        <p class="text-slate-400 text-xs mb-1">月間ガソリン消費量</p>
        <p class="text-sky-400 font-bold text-2xl">{monthlyLiters.toFixed(1)}<span class="text-sm font-normal text-slate-300 ml-1">L</span></p>
      </div>
      <div class="bg-slate-700 rounded-lg p-4 text-center">
        <p class="text-slate-400 text-xs mb-1">月間ガソリン代</p>
        <p class="text-sky-400 font-bold text-2xl">{fmt(monthlyCost)}<span class="text-sm font-normal text-slate-300 ml-1">円</span></p>
      </div>
      <div class="bg-sky-900 border border-sky-500 rounded-lg p-4 text-center">
        <p class="text-slate-300 text-xs mb-1">年間ガソリン代</p>
        <p class="text-sky-300 font-bold text-2xl">{fmt(yearlyCost)}<span class="text-sm font-normal text-slate-300 ml-1">円</span></p>
      </div>
      <div class="bg-slate-700 rounded-lg p-4 text-center">
        <p class="text-slate-400 text-xs mb-1">1km走行コスト</p>
        <p class="text-sky-400 font-bold text-2xl">{costPerKm.toFixed(1)}<span class="text-sm font-normal text-slate-300 ml-1">円/km</span></p>
      </div>
      <div class="bg-slate-700 rounded-lg p-4 text-center col-span-2 md:col-span-2">
        <p class="text-slate-400 text-xs mb-1">燃費を1km/L改善した場合の年間節約額</p>
        <p class="text-green-400 font-bold text-2xl">▲ {fmt(savingPerYear)}<span class="text-sm font-normal text-slate-300 ml-1">円/年</span></p>
      </div>
    </div>
  </div>

  <p class="text-xs text-slate-500">※ 計算結果は参考値です。ガソリン単価は日々変動します。</p>
</div>
