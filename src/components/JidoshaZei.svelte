<script lang="ts">
  type CarType = 'normal' | 'kei';

  let carType = $state<CarType>('normal');
  let displacement = $state(1500);
  let registrationYear = $state(2022);
  let isEV = $state(false);

  const currentYear = 2026;
  const yearsOld = $derived(currentYear - registrationYear);

  // 自動車税テーブル（普通車）
  function getNormalTax(cc: number): number {
    if (cc <= 1000) return 25000;
    if (cc <= 1500) return 30500;
    if (cc <= 2000) return 36000;
    if (cc <= 2500) return 43500;
    if (cc <= 3000) return 50000;
    if (cc <= 3500) return 57000;
    if (cc <= 4000) return 65500;
    if (cc <= 4500) return 75500;
    if (cc <= 6000) return 87000;
    return 110000;
  }

  const baseTax = $derived(carType === 'kei' ? 10800 : getNormalTax(displacement));

  // 重課率
  const surchargeRate = $derived(
    carType === 'kei'
      ? 0
      : yearsOld >= 18
      ? 1.20
      : yearsOld >= 13
      ? 1.15
      : 1.0
  );

  // EV割引（新車登録翌年のみ75%軽減）
  const evDiscount = $derived(isEV && yearsOld <= 1 ? 0.25 : 1.0);

  const finalTax = $derived(Math.floor(baseTax * surchargeRate * evDiscount));

  // 自動車重量税（車検2年分、普通車1500kg想定）
  const weightTaxBase = $derived(carType === 'kei' ? 6600 : 24600);
  const weightTaxFinal = $derived(
    carType === 'kei'
      ? (yearsOld >= 18 ? 8800 : yearsOld >= 13 ? 8200 : 6600)
      : (yearsOld >= 18 ? 37800 : yearsOld >= 13 ? 34200 : 24600)
  );

  function fmt(n: number) {
    return n.toLocaleString('ja-JP');
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-2">車種区分</label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" bind:group={carType} value="normal" class="accent-sky-500" />
          <span class="text-slate-300">普通車</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" bind:group={carType} value="kei" class="accent-sky-500" />
          <span class="text-slate-300">軽自動車</span>
        </label>
      </div>
    </div>

    {#if carType === 'normal'}
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        排気量：<span class="text-sky-400 font-bold">{displacement.toLocaleString()} cc</span>
      </label>
      <input type="range" min="660" max="6000" step="100" bind:value={displacement} class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>660cc</span><span>6,000cc</span>
      </div>
    </div>
    {/if}

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        新車登録年：<span class="text-sky-400 font-bold">{registrationYear}年</span>（経過{yearsOld}年）
      </label>
      <input type="range" min="2005" max="2026" step="1" bind:value={registrationYear} class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>2005年</span><span>2026年</span>
      </div>
    </div>

    <div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" bind:checked={isEV} class="w-5 h-5 accent-sky-500" />
        <div>
          <span class="text-slate-300 font-medium">電気自動車・燃料電池車</span>
          <p class="text-slate-500 text-xs">グリーン化特例（新車登録翌年度のみ75%軽減）</p>
        </div>
      </label>
    </div>
  </div>

  <!-- Results -->
  <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <h3 class="text-lg font-bold text-white mb-4">計算結果</h3>

    {#if yearsOld >= 18 && carType === 'normal'}
      <div class="bg-red-950 border border-red-700 rounded-lg p-3 mb-4 text-sm text-red-300">
        ⚠️ 18年超のため自動車税が約20%重課（{surchargeRate * 100 - 100}%増）されています。
      </div>
    {:else if yearsOld >= 13 && carType === 'normal'}
      <div class="bg-yellow-950 border border-yellow-700 rounded-lg p-3 mb-4 text-sm text-yellow-300">
        ⚠️ 13年超のため自動車税が約15%重課（{surchargeRate * 100 - 100}%増）されています。
      </div>
    {/if}

    {#if isEV && yearsOld <= 1}
      <div class="bg-green-950 border border-green-700 rounded-lg p-3 mb-4 text-sm text-green-300">
        ✅ グリーン化特例が適用され、自動車税が75%軽減されています（新車登録翌年度のみ）。
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-sky-900 border border-sky-500 rounded-lg p-4 text-center">
        <p class="text-slate-300 text-xs mb-1">自動車税（種別割）年額</p>
        <p class="text-sky-300 font-bold text-2xl">{fmt(finalTax)}<span class="text-sm font-normal text-slate-300 ml-1">円/年</span></p>
        {#if baseTax !== finalTax}
          <p class="text-slate-500 text-xs mt-1">基準額：{fmt(baseTax)}円</p>
        {/if}
      </div>
      <div class="bg-slate-700 rounded-lg p-4 text-center">
        <p class="text-slate-400 text-xs mb-1">自動車重量税（車検2年分目安）</p>
        <p class="text-sky-400 font-bold text-2xl">{fmt(weightTaxFinal)}<span class="text-sm font-normal text-slate-300 ml-1">円</span></p>
        {#if carType === 'normal'}
          <p class="text-slate-500 text-xs mt-1">※1,500kg想定</p>
        {/if}
      </div>
      <div class="bg-slate-700 rounded-lg p-4 text-center">
        <p class="text-slate-400 text-xs mb-1">合計（税金のみ）</p>
        <p class="text-sky-400 font-bold text-2xl">{fmt(finalTax + weightTaxFinal / 2)}<span class="text-sm font-normal text-slate-300 ml-1">円/年</span></p>
        <p class="text-slate-500 text-xs mt-1">重量税は2年分を年割換算</p>
      </div>
    </div>

    <div class="mt-4 bg-slate-700 rounded-lg p-4">
      <p class="text-slate-300 text-sm font-medium mb-2">自動車税テーブル（普通車）</p>
      <div class="grid grid-cols-2 gap-1 text-xs text-slate-400">
        {#each [[1000,25000],[1500,30500],[2000,36000],[2500,43500],[3000,50000],[3500,57000],[4000,65500],[4500,75500],[6000,87000]] as [cc, tax]}
          <div class={`flex justify-between px-2 py-1 rounded ${displacement <= cc && carType === 'normal' ? 'bg-sky-900 text-sky-300' : ''}`}>
            <span>〜{cc.toLocaleString()}cc</span>
            <span>{tax.toLocaleString()}円</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <p class="text-xs text-slate-500">※ 重量税は1,500kgの普通車を想定した目安です。実際の重量税は車両重量・エコカー対応状況により異なります。</p>
</div>
