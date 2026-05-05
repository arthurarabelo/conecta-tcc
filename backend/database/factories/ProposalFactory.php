<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Proposal>
 */
class ProposalFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'professor_id' => User::factory()->create(['role' => 'professor'])->id,
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'prerequisites' => null,
            'max_slots' => fake()->numberBetween(1, 10),
            'status' => 'open',
        ];
    }
}
