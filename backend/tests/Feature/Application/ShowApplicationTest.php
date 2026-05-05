<?php

namespace Tests\Feature\Application;

use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShowApplicationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_student_can_view_own_application(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('api')->plainTextToken;
        $application = Application::factory()->create(['student_id' => $student->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/applications/{$application->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $application->id]);
    }

    /**
     * @return void
     */
    public function test_professor_can_view_application_for_own_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $application = Application::factory()->create([
            'proposal_id' => \App\Models\Proposal::factory()->create(['professor_id' => $professor->id])->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/applications/{$application->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $application->id]);
    }

    /**
     * @return void
     */
    public function test_student_cannot_view_another_students_application(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('api')->plainTextToken;
        $application = Application::factory()->create();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/applications/{$application->id}")
            ->assertStatus(403);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_view_application(): void
    {
        $application = Application::factory()->create();

        $this->getJson("/api/applications/{$application->id}")->assertStatus(401);
    }
}
