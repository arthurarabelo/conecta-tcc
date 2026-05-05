<?php

namespace Database\Factories;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => User::factory()->create(['role' => 'student'])->id,
            'proposal_id' => Proposal::factory()->create()->id,
            'status' => 'pending',
            'applied_at' => now(),
            'reviewed_at' => null,
            'feedback' => null,
        ];
    }
}
